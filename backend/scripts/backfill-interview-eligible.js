const prisma =
  require("../src/configs/prisma").default || require("../src/configs/prisma");

async function main() {
  console.log(
    "Backfilling interviewEligible for existing applications with totalScore >= 75..."
  );
  const result = await prisma.application.updateMany({
    where: {
      totalScore: {
        gte: 75,
      },
    },
    data: {
      interviewEligible: true,
    },
  });
  console.log(`Updated ${result.count} applications`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    try {
      await prisma.$disconnect();
    } catch (e) {}
  });
