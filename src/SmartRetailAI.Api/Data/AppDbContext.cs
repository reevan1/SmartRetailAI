using Microsoft.EntityFrameworkCore;
using SmartRetailAI.Api.Models;

namespace SmartRetailAI.Api.Data;

public class AppDbContext(DbContextOptions<AppDbContext> options)
    : DbContext(options)
{
    public DbSet<Product> Products => Set<Product>();

    public DbSet<Category> Categories => Set<Category>();

    public DbSet<Supplier> Suppliers => Set<Supplier>();

    public DbSet<ProductSupplier> ProductSuppliers =>
        Set<ProductSupplier>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<Product>()
            .HasIndex(product => product.Barcode)
            .IsUnique();

        modelBuilder.Entity<Category>()
            .HasIndex(category => category.Name)
            .IsUnique();

        modelBuilder.Entity<Supplier>()
            .HasIndex(supplier => supplier.Name)
            .IsUnique();

        modelBuilder.Entity<ProductSupplier>()
            .HasKey(productSupplier => new
            {
                productSupplier.ProductId,
                productSupplier.SupplierId
            });

        modelBuilder.Entity<ProductSupplier>()
            .HasOne(productSupplier => productSupplier.Product)
            .WithMany()
            .HasForeignKey(productSupplier =>
                productSupplier.ProductId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<ProductSupplier>()
            .HasOne(productSupplier => productSupplier.Supplier)
            .WithMany()
            .HasForeignKey(productSupplier =>
                productSupplier.SupplierId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<ProductSupplier>()
            .HasIndex(productSupplier =>
                productSupplier.SupplierId);
    }
}