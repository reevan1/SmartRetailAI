using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SmartRetailAI.Api.Data;
using SmartRetailAI.Api.Dtos;
using SmartRetailAI.Api.Models;

namespace SmartRetailAI.Api.Controllers;

[ApiController]
[Route("api/product-suppliers")]
public class ProductSuppliersController(AppDbContext dbContext)
    : ControllerBase
{
    [HttpGet("product/{productId:int}")]
    public async Task<IActionResult> GetSuppliersForProduct(int productId)
    {
        var productExists = await dbContext.Products
            .AnyAsync(product =>
                product.Id == productId && product.IsActive);

        if (!productExists)
        {
            return NotFound(new
            {
                message = "The product does not exist."
            });
        }

        var suppliers = await dbContext.ProductSuppliers
            .AsNoTracking()
            .Where(link =>
                link.ProductId == productId &&
                link.Supplier.IsActive)
            .OrderByDescending(link => link.IsPreferred)
            .ThenBy(link => link.Supplier.Name)
            .Select(link => new
            {
                link.ProductId,
                link.SupplierId,
                supplierName = link.Supplier.Name,
                link.SupplierCost,
                link.IsPreferred,
                link.LeadTimeDays,
                link.CreatedAtUtc
            })
            .ToListAsync();

        return Ok(suppliers);
    }

    [HttpPost]
    public async Task<IActionResult> CreateProductSupplier(
        ProductSupplierRequest request)
    {
        var productExists = await dbContext.Products
            .AnyAsync(product =>
                product.Id == request.ProductId &&
                product.IsActive);

        if (!productExists)
        {
            return BadRequest(new
            {
                message = "The selected product does not exist."
            });
        }

        var supplierExists = await dbContext.Suppliers
            .AnyAsync(supplier =>
                supplier.Id == request.SupplierId &&
                supplier.IsActive);

        if (!supplierExists)
        {
            return BadRequest(new
            {
                message = "The selected supplier does not exist."
            });
        }

        var linkExists = await dbContext.ProductSuppliers
            .AnyAsync(link =>
                link.ProductId == request.ProductId &&
                link.SupplierId == request.SupplierId);

        if (linkExists)
        {
            return Conflict(new
            {
                message = "This supplier is already linked to the product."
            });
        }

        if (request.IsPreferred)
        {
            var currentPreferredLinks =
                await dbContext.ProductSuppliers
                    .Where(link =>
                        link.ProductId == request.ProductId &&
                        link.IsPreferred)
                    .ToListAsync();

            foreach (var link in currentPreferredLinks)
            {
                link.IsPreferred = false;
            }
        }

        var productSupplier = new ProductSupplier
        {
            ProductId = request.ProductId,
            SupplierId = request.SupplierId,
            SupplierCost = request.SupplierCost,
            IsPreferred = request.IsPreferred,
            LeadTimeDays = request.LeadTimeDays
        };

        dbContext.ProductSuppliers.Add(productSupplier);
        await dbContext.SaveChangesAsync();

        return Created(
            $"/api/product-suppliers/product/{request.ProductId}",
            new
            {
                productSupplier.ProductId,
                productSupplier.SupplierId,
                productSupplier.SupplierCost,
                productSupplier.IsPreferred,
                productSupplier.LeadTimeDays,
                productSupplier.CreatedAtUtc
            });
    }

    [HttpPut("{productId:int}/{supplierId:int}")]
    public async Task<IActionResult> UpdateProductSupplier(
        int productId,
        int supplierId,
        ProductSupplierRequest request)
    {
        if (productId != request.ProductId ||
            supplierId != request.SupplierId)
        {
            return BadRequest(new
            {
                message = "The URL IDs must match the request IDs."
            });
        }

        var productSupplier = await dbContext.ProductSuppliers
            .FirstOrDefaultAsync(link =>
                link.ProductId == productId &&
                link.SupplierId == supplierId);

        if (productSupplier is null)
        {
            return NotFound();
        }

        if (request.IsPreferred)
        {
            var currentPreferredLinks =
                await dbContext.ProductSuppliers
                    .Where(link =>
                        link.ProductId == productId &&
                        link.SupplierId != supplierId &&
                        link.IsPreferred)
                    .ToListAsync();

            foreach (var link in currentPreferredLinks)
            {
                link.IsPreferred = false;
            }
        }

        productSupplier.SupplierCost = request.SupplierCost;
        productSupplier.IsPreferred = request.IsPreferred;
        productSupplier.LeadTimeDays = request.LeadTimeDays;

        await dbContext.SaveChangesAsync();

        return NoContent();
    }

    [HttpDelete("{productId:int}/{supplierId:int}")]
    public async Task<IActionResult> DeleteProductSupplier(
        int productId,
        int supplierId)
    {
        var productSupplier = await dbContext.ProductSuppliers
            .FirstOrDefaultAsync(link =>
                link.ProductId == productId &&
                link.SupplierId == supplierId);

        if (productSupplier is null)
        {
            return NotFound();
        }

        dbContext.ProductSuppliers.Remove(productSupplier);
        await dbContext.SaveChangesAsync();

        return NoContent();
    }
}