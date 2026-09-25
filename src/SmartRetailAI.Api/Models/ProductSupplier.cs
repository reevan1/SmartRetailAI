using Microsoft.EntityFrameworkCore;

namespace SmartRetailAI.Api.Models;

public class ProductSupplier
{
    public int ProductId { get; set; }

    public Product Product { get; set; } = null!;

    public int SupplierId { get; set; }

    public Supplier Supplier { get; set; } = null!;

    [Precision(12, 3)]
    public decimal? SupplierCost { get; set; }

    public bool IsPreferred { get; set; }

    public int? LeadTimeDays { get; set; }

    public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;
}