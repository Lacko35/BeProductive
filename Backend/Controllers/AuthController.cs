using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Backend.Code;
using Backend.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

namespace Backend.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly ApplicationContext context;
        private readonly IConfiguration configuration;

        public AuthController(ApplicationContext context_, IConfiguration configuration_)
        {
            context = context_;
            configuration = configuration_;
        }

        [HttpPost("Register")]
        public async Task<ActionResult> Register([FromBody] RegisterDTO dto)
        {
            if(context.Profiles.Any(u => u.Email == dto.Email))
            {
                return BadRequest("Email vec postoji!");
            }

            if(context.Profiles.Any(u => u.Username == dto.Username))
            {
                return BadRequest("Username vec postoji!");
            }

            var user = new UserProfile
            {
                FirstName = dto.FirstName,
                LastName = dto.LastName,
                Username = dto.Username,
                Email = dto.Email,
                HashPassword = BCrypt.Net.BCrypt.HashPassword(dto.Password),
                Role = "User"
            };

            await context.Profiles.AddAsync(user);
            await context.SaveChangesAsync();

            return Ok(
                new AuthResponseDTO
                {
                    Token = GenerateToken(user),
                    Username = user.Username,
                    Role = user.Role
                }
            );
        }

        [HttpPost("Login")]
        public async Task<ActionResult> Login(LoginDTO dto)
        {
            var user = await context.Profiles.FirstOrDefaultAsync(u => u.Email == dto.Email);

            if(user == null || !BCrypt.Net.BCrypt.Verify(dto.Password, user.HashPassword))
            {
                return Unauthorized("Neispravan email ili sifra");
            }

            return Ok(
                new AuthResponseDTO
                {
                    Token = GenerateToken(user),
                    Username = user.Username,
                    Role = user.Role
                }
            );            
        }

        private string GenerateToken(UserProfile user)
        {
            var claims = new[]
            {
                new Claim(ClaimTypes.NameIdentifier, user.UserID.ToString()),
                new Claim(ClaimTypes.Name, user.Username),
                new Claim(ClaimTypes.Role, user.Role)
            };

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(configuration["JWT:Key"] ?? throw new InvalidOperationException("JWT kljuc nije konfigurisan!")));
            var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var token = new JwtSecurityToken(
                issuer: configuration["JWT:Producer"],
                audience: configuration["JWT:Consumer"],
                claims: claims,
                expires: DateTime.UtcNow.AddDays(7),
                signingCredentials: credentials
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }
}