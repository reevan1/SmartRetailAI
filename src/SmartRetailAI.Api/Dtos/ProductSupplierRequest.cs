using System.ComponentModel.DataAnnotations;
using Microsoft.EntityFrameworkCore;

namespace SmartRetailAI.Api.Dtos;

public class ProductSupplierRequest
{
    [Range(1, int.MaxValue)]
    public int ProductId { get; set; }

    [Range(1, int.MaxValue)]
    public int SupplierId { get; set; }

    [Range(0, double.MaxValue)]
    [Precision(12, 3)]
    public decimal? SupplierCost { get; set; }

    public bool IsPreferred { get; set; }

    [Range(0, int.MaxValue)]
    public int? LeadTimeDays { get; set; }
}