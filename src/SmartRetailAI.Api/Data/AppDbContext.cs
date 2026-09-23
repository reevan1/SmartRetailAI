using Microsoft.EntityFrameworkCore;
using SmartRetailAI.Api.Models;

namespace SmartRetailAI.Api.Data;

public class AppDbContext(DbContextOptions<AppDbContext> options)
    : DbContext(options)
{
    public DbSet<Product> Products => Set<Product>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<Product>()
            .HasIndex(product => product.Barcode)
            .IsUnique();
    }
}