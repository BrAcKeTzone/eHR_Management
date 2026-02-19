import { PrismaClient, User, UserRole } from "@prisma/client";
import bcrypt from "bcryptjs";
import ApiError from "../../utils/ApiError";
import otpGenerator from "otp-generator";
import sendEmail, { sendEmailWithRetry } from "../../utils/email";
import { Prisma } from "@prisma/client";

const prisma = new PrismaClient();

interface CreateUserData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role?: UserRole;
  civilStatus?: string;
  houseNo?: string;
  street?: string;
  barangay?: string;
  city?: string;
  province?: string;
  zipCode?: string;
  education?: string;
  references?: string;
}

interface UpdateUserData {
  email?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  role?: UserRole;
  civilStatus?: string;
  houseNo?: string;
  street?: string;
  barangay?: string;
  city?: string;
  province?: string;
  zipCode?: string;
  education?: string;
  references?: string;
}

interface GetUsersOptions {
  page?: number;
  limit?: number;
  role?: UserRole;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  specialization?: number;
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
  options: GetUsersOptions = {},
): Promise<UsersResponse> => {
  const {
    page = 1,
    limit = 10,
    role,
    search,
    sortBy = "createdAt",
    sortOrder = "desc",
    specialization,
  } = options;

  const skip = (page - 1) * limit;

  // Only allow valid sort fields
  const validSortFields = [
    "firstName",
    "lastName",
    "name",
    "email",
    "role",
    "createdAt",
  ];
  let sortField = validSortFields.includes(sortBy) ? sortBy : "createdAt";

  // Map firstName, lastName, and name to lastName for name sorting (standard practice)
  if (
    sortField === "firstName" ||
    sortField === "lastName" ||
    sortField === "name"
  ) {
    sortField = "lastName";
  }

  // Build where clause
  const where: any = {};
  if (role) {
    where.role = role;
  }
  if (specialization) {
    where.applications = {
      some: {
        specializationId: specialization,
      },
    };
  }
  if (search) {
    // Use case-insensitive search for MySQL
    const searchLower = search.toLowerCase();
    where.OR = [
      {
        firstName: {
          contains: searchLower,
        },
      },
      {
        lastName: {
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

    // Build order by clause
    let orderByClause: any;
    if (sortField === "lastName") {
      // When sorting by name, sort by lastName then firstName
      orderByClause = [{ lastName: sortOrder }, { firstName: sortOrder }];
    } else {
      // For other fields, sort normally
      orderByClause = { [sortField]: sortOrder };
    }

    // Get users
    const users = await prisma.user.findMany({
      where,
      skip,
      take: limit,
      orderBy: orderByClause,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        role: true,
        profilePicture: true,
        profilePicturePublicId: true,
        civilStatus: true,
        houseNo: true,
        street: true,
        barangay: true,
        city: true,
        province: true,
        zipCode: true,
        education: true,
        references: true,
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
  userId: number,
): Promise<Omit<User, "password">> => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      phone: true,
      role: true,
      profilePicture: true,
      profilePicturePublicId: true,
      civilStatus: true,
      houseNo: true,
      street: true,
      barangay: true,
      city: true,
      province: true,
      zipCode: true,
      education: true,
      references: true,
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
  userData: CreateUserData,
): Promise<Omit<User, "password">> => {
  const {
    email,
    password,
    firstName,
    lastName,
    phone,
    role = UserRole.APPLICANT,
    civilStatus,
    houseNo,
    street,
    barangay,
    city,
    province,
    zipCode,
    education,
    references,
  } = userData;

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
      firstName,
      lastName,
      phone: phone || null,
      role,
      civilStatus: civilStatus || null,
      houseNo: houseNo || null,
      street: street || null,
      barangay: barangay || null,
      city: city || null,
      province: province || null,
      zipCode: zipCode || null,
      education: education || null,
      references: references || null,
    },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      phone: true,
      role: true,
      profilePicture: true,
      profilePicturePublicId: true,
      civilStatus: true,
      houseNo: true,
      street: true,
      barangay: true,
      city: true,
      province: true,
      zipCode: true,
      education: true,
      references: true,
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
  requestingUserRole?: UserRole,
): Promise<Omit<User, "password">> => {
  const {
    email,
    firstName,
    lastName,
    phone,
    role,
    civilStatus,
    houseNo,
    street,
    barangay,
    city,
    province,
    zipCode,
    education,
    references,
  } = userData;

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
  if (firstName && firstName !== existingUser.firstName)
    updateData.firstName = firstName;
  if (lastName && lastName !== existingUser.lastName)
    updateData.lastName = lastName;
  if (phone !== undefined) updateData.phone = phone || null;
  if (role && role !== existingUser.role) updateData.role = role;
  if (civilStatus !== undefined) updateData.civilStatus = civilStatus || null;
  if (houseNo !== undefined) updateData.houseNo = houseNo || null;
  if (street !== undefined) updateData.street = street || null;
  if (barangay !== undefined) updateData.barangay = barangay || null;
  if (city !== undefined) updateData.city = city || null;
  if (province !== undefined) updateData.province = province || null;
  if (zipCode !== undefined) updateData.zipCode = zipCode || null;
  if (education !== undefined) updateData.education = education || null;
  if (references !== undefined) updateData.references = references || null;

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
      firstName: true,
      lastName: true,
      phone: true,
      role: true,
      profilePicture: true,
      profilePicturePublicId: true,
      civilStatus: true,
      houseNo: true,
      street: true,
      barangay: true,
      city: true,
      province: true,
      zipCode: true,
      education: true,
      references: true,
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
  newPassword: string,
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
    user.password,
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
  userId: number,
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

// Send OTP for HR deletion confirmation
export const sendOtpForHrDeletion = async (
  hrEmail: string,
): Promise<{ message: string }> => {
  // Verify HR user exists
  const hrUser = await prisma.user.findUnique({
    where: { email: hrEmail },
  });

  if (!hrUser || hrUser.role !== UserRole.HR) {
    throw new ApiError(403, "Only HR users can delete other HR users");
  }

  // Generate OTP
  const otpOptions = {
    upperCase: false,
    specialChars: false,
    digits: true,
    lowerCaseAlphabets: false,
    upperCaseAlphabets: false,
  };
  const otp = otpGenerator.generate(6, otpOptions);
  const expires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

  try {
    // Store OTP in database
    await prisma.otp.create({
      data: {
        email: hrEmail,
        otp,
        createdAt: expires,
      },
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      throw new ApiError(400, "Failed to create OTP record");
    }
    throw error;
  }

  try {
    // Send OTP via email
    await sendEmailWithRetry({
      email: hrEmail,
      subject: "OTP for HR User Deletion Confirmation",
      message: `Your OTP for deleting an HR user is: ${otp}. It will expire in 10 minutes. Do not share this OTP with anyone.`,
    });
  } catch (error) {
    console.error(error);
    throw new ApiError(
      500,
      "There was an error sending the email. Please try again later.",
    );
  }

  return { message: "OTP sent to your email for HR deletion confirmation" };
};

// Verify OTP and delete HR user
export const verifyOtpAndDeleteHr = async (
  userToDeleteId: number,
  requestingHrEmail: string,
  otp: string,
  requestingHrId: number,
  requestingUserRole: UserRole,
): Promise<{ message: string }> => {
  // Check if requesting user is HR
  if (requestingUserRole !== UserRole.HR) {
    throw new ApiError(403, "Only HR users can delete other HR users");
  }

  // Get the user to be deleted
  const userToDelete = await prisma.user.findUnique({
    where: { id: userToDeleteId },
  });

  if (!userToDelete) {
    throw new ApiError(404, "User not found");
  }

  // Check if user to delete is HR
  if (userToDelete.role !== UserRole.HR) {
    throw new ApiError(
      403,
      "This user is not an HR. Use regular delete instead.",
    );
  }

  // Prevent HR from deleting themselves
  if (userToDelete.id === requestingHrId) {
    throw new ApiError(403, "You cannot delete your own account");
  }

  // Verify OTP
  const otpRecord = await prisma.otp.findFirst({
    where: {
      email: requestingHrEmail,
      otp: otp,
    },
  });

  if (!otpRecord) {
    throw new ApiError(400, "Invalid OTP");
  }

  // Check if OTP is expired
  if (new Date() > otpRecord.createdAt) {
    throw new ApiError(400, "OTP has expired");
  }

  try {
    // Delete the HR user
    await prisma.user.delete({
      where: { id: userToDeleteId },
    });

    // Delete the OTP record after successful verification
    await prisma.otp.delete({
      where: { id: otpRecord.id },
    });

    return { message: "HR user deleted successfully" };
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      throw new ApiError(400, "Failed to delete user");
    }
    throw error;
  }
};

// Check if email exists
export const checkEmailExists = async (email: string): Promise<boolean> => {
  const user = await prisma.user.findUnique({
    where: { email },
  });
  return !!user;
};

// Update profile picture
export const updateProfilePicture = async (
  userId: number,
  file: any,
): Promise<Omit<User, "password">> => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  // Delete old profile picture from Cloudinary if exists
  if (user.profilePicturePublicId) {
    try {
      const cloudinary = (await import("../../configs/cloudinary")).default;
      await cloudinary.uploader.destroy(user.profilePicturePublicId);
    } catch (error) {
      console.error("Error deleting old profile picture:", error);
    }
  }

  // Update user with new profile picture
  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: {
      profilePicture: file.path || file.url,
      profilePicturePublicId: file.filename || file.public_id || "",
    },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      phone: true,
      role: true,
      profilePicture: true,
      profilePicturePublicId: true,
      civilStatus: true,
      houseNo: true,
      street: true,
      barangay: true,
      city: true,
      province: true,
      zipCode: true,
      education: true,
      references: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return updatedUser;
};

// Delete profile picture
export const deleteProfilePicture = async (
  userId: number,
): Promise<Omit<User, "password">> => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  // Delete profile picture from Cloudinary if exists
  if (user.profilePicturePublicId) {
    try {
      const cloudinary = (await import("../../configs/cloudinary")).default;
      await cloudinary.uploader.destroy(user.profilePicturePublicId);
    } catch (error) {
      console.error("Error deleting profile picture:", error);
    }
  }

  // Update user to remove profile picture
  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: {
      profilePicture: null,
      profilePicturePublicId: null,
    },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      phone: true,
      role: true,
      profilePicture: true,
      profilePicturePublicId: true,
      civilStatus: true,
      houseNo: true,
      street: true,
      barangay: true,
      city: true,
      province: true,
      zipCode: true,
      education: true,
      references: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return updatedUser;
};
