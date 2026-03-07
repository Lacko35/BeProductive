using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Backend.Models
{
    public class UserProfile
    {
        [Key]
        [Column("user_id")]
        public int UserID { get; set; }

        [MaxLength(15)]
        [Column("first_name")]
        public required string FirstName { get; set; }

        [Column("last_name")]
        [MaxLength(25)]
        public required string LastName { get; set; }

        [MaxLength(20)]
        [Column("username")]
        public required string Username { get; set; }

        [MaxLength(30)]
        [Column("email")]
        public required string Email { get; set; }

        [Column("hash_password")]
        public required string HashPassword { get; set; }

        [Column("profile_picture")]
        public string? ProfilePicture { get; set; }

        [Column("role")]
        public required string Role { get; set; } = "User";

        public List<TaskItem> Tasks { get; set; } = new List<TaskItem>();
    }
}