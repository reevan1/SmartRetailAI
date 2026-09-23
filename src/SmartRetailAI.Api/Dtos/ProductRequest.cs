using System.ComponentModel.DataAnnotations;
using Microsoft.EntityFrameworkCore;

namespace SmartRetailAI.Api.Dtos;

public class ProductRequest
{
    [Required]
    [MaxLength(50)]
    public string Barcode { get; set; } = string.Empty;

    [Required]
    [MaxLength(150)]
    public string Name { get; set; } = string.Empty;

    [MaxLength(500)]
    public string? Description { get; set; }

    [Range(1, int.MaxValue)]
    public int? CategoryId { get; set; }

    [Range(0, double.MaxValue)]
    [Precision(12, 3)]
    public decimal CostPrice { get; set; }

    [Range(0, double.MaxValue)]
    [Precision(12, 3)]
    public decimal SellingPrice { get; set; }

    [Range(0, 100)]
    [Precision(5, 2)]
    public decimal TaxRate { get; set; }

    [Range(0, int.MaxValue)]
    public int MinimumStock { get; set; }

    [Range(0, int.MaxValue)]
    public int ReorderQuantity { get; set; }
}