import { PrismaClient, User, UserRole } from "@prisma/client";
import bcrypt from "bcryptjs";
import ApiError from "../../utils/ApiError";

const prisma = new PrismaClient();

interface CreateUserData {
  email: string;
  password: string;
  name: string;
  phone?: string;
  role?: UserRole;
}

interface UpdateUserData {
  email?: string;
  name?: string;
  phone?: string;
  role?: UserRole;
}

interface GetUsersOptions {
  page?: number;
  limit?: number;
  role?: UserRole;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

interface UsersResponse {
  users: Omit<User, "password">[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
  hasNext: boolean;
  hasPrev: boolean;
}

// Get all users with pagination and filtering
export const getAllUsers = async (
  options: GetUsersOptions = {}
): Promise<UsersResponse> => {
  const {
    page = 1,
    limit = 10,
    role,
    search,
    sortBy = "createdAt",
    sortOrder = "desc",
  } = options;

  const skip = (page - 1) * limit;

  // Only allow valid sort fields
  const validSortFields = ["name", "email", "role", "createdAt"];
  const sortField = validSortFields.includes(sortBy) ? sortBy : "createdAt";

  // Build where clause
  const where: any = {};
  if (role) {
    where.role = role;
  }
  if (search) {
    // Use case-insensitive search for MySQL
    const searchLower = search.toLowerCase();
    where.OR = [
      {
        name: {
          contains: searchLower,
        },
      },
      {
        email: {
          contains: searchLower,
        },
      },
    ];
  }

  try {
    // Get total count for pagination
    const totalCount = await prisma.user.count({ where });
    // Get users
    const users = await prisma.user.findMany({
      where,
      skip,
      take: limit,
      orderBy: { [sortField]: sortOrder },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    const totalPages = Math.ceil(totalCount / limit);
    return {
      users,
      totalCount,
      totalPages,
      currentPage: page,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    };
  } catch (err: any) {
    throw new ApiError(500, err.message || "Failed to fetch users");
  }
};

// Get user by ID
export const getUserById = async (
  userId: number
): Promise<Omit<User, "password">> => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      name: true,
      phone: true,
      role: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  return user;
};

// Create new user
export const createUser = async (
  userData: CreateUserData
): Promise<Omit<User, "password">> => {
  const { email, password, name, phone, role = UserRole.APPLICANT } = userData;

  // Check if user already exists
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    throw new ApiError(400, "User with this email already exists");
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 12);

  // Create user
  const user = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      name,
      phone: phone || null,
      role,
    },
    select: {
      id: true,
      email: true,
      name: true,
      phone: true,
      role: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return user;
};

// Update user
export const updateUser = async (
  userId: number,
  userData: UpdateUserData,
  requestingUserId?: number,
  requestingUserRole?: UserRole
): Promise<Omit<User, "password">> => {
  const { email, name, phone, role } = userData;

  // Check if user exists
  const existingUser = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!existingUser) {
    throw new ApiError(404, "User not found");
  }

  // Security check: Prevent role changes unless requesting user is HR
  if (
    role &&
    role !== existingUser.role &&
    requestingUserRole !== UserRole.HR
  ) {
    throw new ApiError(403, "Only HR can change user roles");
  }

  // Security check: Prevent HR users from changing other HR users' roles
  if (
    existingUser.role === UserRole.HR &&
    role &&
    role !== UserRole.HR &&
    requestingUserId !== userId
  ) {
    throw new ApiError(403, "Cannot change HR user role");
  }

  // If email is being updated, check for conflicts
  if (email && email !== existingUser.email) {
    const emailExists = await prisma.user.findUnique({
      where: { email },
    });

    if (emailExists) {
      throw new ApiError(400, "User with this email already exists");
    }
  }

  // Prepare update data
  const updateData: any = {};
  if (email && email !== existingUser.email) updateData.email = email;
  if (name && name !== existingUser.name) updateData.name = name;
  if (phone !== undefined) updateData.phone = phone || null;
  if (role && role !== existingUser.role) updateData.role = role;

  // Only update if there are changes
  if (Object.keys(updateData).length === 0) {
    // Return existing user if no changes
    const { password: _, ...userWithoutPassword } = existingUser;
    return userWithoutPassword as Omit<User, "password">;
  }

  // Update user
  const user = await prisma.user.update({
    where: { id: userId },
    data: updateData,
    select: {
      id: true,
      email: true,
      name: true,
      phone: true,
      role: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return user;
};

// Update user password
export const updateUserPassword = async (
  userId: number,
  currentPassword: string,
  newPassword: string
): Promise<{ message: string }> => {
  // Get user with password
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  // Verify current password
  const isCurrentPasswordValid = await bcrypt.compare(
    currentPassword,
    user.password
  );
  if (!isCurrentPasswordValid) {
    throw new ApiError(400, "Current password is incorrect");
  }

  // Hash new password
  const hashedNewPassword = await bcrypt.hash(newPassword, 12);

  // Update password
  await prisma.user.update({
    where: { id: userId },
    data: { password: hashedNewPassword },
  });

  return { message: "Password updated successfully" };
};

// Delete user
export const deleteUser = async (
  userId: number
): Promise<{ message: string }> => {
  // Check if user exists
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  // Prevent deletion of HR users for security
  if (user.role === UserRole.HR) {
    throw new ApiError(403, "Cannot delete HR users");
  }

  // Delete user (cascade will handle related records)
  await prisma.user.delete({
    where: { id: userId },
  });

  return { message: "User deleted successfully" };
};

// Get user statistics
export const getUserStats = async (): Promise<{
  total: number;
  hr: number;
  applicants: number;
  recent: number;
}> => {
  const total = await prisma.user.count();
  const hr = await prisma.user.count({ where: { role: UserRole.HR } });
  const applicants = await prisma.user.count({
    where: { role: UserRole.APPLICANT },
  });

  // Users created in the last 30 days
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const recent = await prisma.user.count({
    where: {
      createdAt: {
        gte: thirtyDaysAgo,
      },
    },
  });

  return { total, hr, applicants, recent };
};
