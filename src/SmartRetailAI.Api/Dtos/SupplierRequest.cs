using System.ComponentModel.DataAnnotations;

namespace SmartRetailAI.Api.Dtos;

public class SupplierRequest
{
    [Required]
    [MaxLength(150)]
    public string Name { get; set; } = string.Empty;

    [MaxLength(150)]
    public string? ContactPerson { get; set; }

    [EmailAddress]
    [MaxLength(254)]
    public string? Email { get; set; }

    [Phone]
    [MaxLength(30)]
    public string? Phone { get; set; }

    [MaxLength(500)]
    public string? Address { get; set; }
}