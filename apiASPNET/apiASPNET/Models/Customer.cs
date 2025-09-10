using System.ComponentModel.DataAnnotations;

namespace apiASPNET.Models;

public class Customer
{
    [Key]
    public int Id { get; set; }

    [Required]
    [MaxLength(150)]
    public string Name { get; set; } = string.Empty;

    [MaxLength(200)]
    public string? Email { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // FK al usuario creador
    [Required]
    public int CreatedBy { get; set; }

    public User? CreatedByUser { get; set; }
}
