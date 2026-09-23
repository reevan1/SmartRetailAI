using System.ComponentModel.DataAnnotations;
using Microsoft.EntityFrameworkCore;

namespace SmartRetailAI.Api.Models;

public class Product
{
    public int Id { get; set; }

    [Required]
    [MaxLength(50)]
    public string Barcode { get; set; } = string.Empty;

    [Required]
    [MaxLength(150)]
    public string Name { get; set; } = string.Empty;

    [MaxLength(500)]
    public string? Description { get; set; }

    public int? CategoryId { get; set; }

    public Category? Category { get; set; }

    [Precision(12, 3)]
    public decimal CostPrice { get; set; }

    [Precision(12, 3)]
    public decimal SellingPrice { get; set; }

    [Precision(5, 2)]
    public decimal TaxRate { get; set; }

    public int MinimumStock { get; set; }

    public int ReorderQuantity { get; set; }

    public bool IsActive { get; set; } = true;

    public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;

    public DateTime? UpdatedAtUtc { get; set; }
}