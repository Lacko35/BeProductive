using Microsoft.EntityFrameworkCore;

namespace Backend.Models
{
    public class ApplicationContext : DbContext
    {
        public ApplicationContext(DbContextOptions<ApplicationContext> context) : base(context) {}

        public DbSet<UserProfile> Profiles { get; set; }

        public DbSet<TaskItem> Tasks { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<TaskItem>(entity =>
            {
                entity.HasKey(t => t.TaskID);

                entity.Property(t => t.Title)
                .IsRequired()
                .HasMaxLength(200);

                entity.Property(t => t.Priority)
                .HasConversion<string>();

                entity.HasOne(t => t.User)
                .WithMany(u => u.Tasks)
                .HasForeignKey(t => t.UserProfileID)
                .OnDelete(DeleteBehavior.Cascade);
            });
        }
    }
}