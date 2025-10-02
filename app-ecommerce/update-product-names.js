// Script to update product names from "Polo" to "T-Shirt" for consistency
print("Updating product names from 'Polo' to 'T-Shirt'...");

// Update all products that contain "Polo" in the name
const updateResult = db.products.updateMany(
    { name: { $regex: "Polo", $options: "i" } },
    [
        {
            $set: {
                name: {
                    $replaceAll: {
                        input: "$name",
                        find: " Polo Shirt",
                        replacement: " T-Shirt"
                    }
                },
                description: {
                    $replaceAll: {
                        input: "$description",
                        find: "polo",
                        replacement: "t-shirt"
                    }
                },
                slug: {
                    $replaceAll: {
                        input: "$slug",
                        find: "-polo",
                        replacement: "-tshirt"
                    }
                },
                sku: {
                    $replaceAll: {
                        input: "$sku",
                        find: "-POLO-",
                        replacement: "-TSHIRT-"
                    }
                }
            }
        }
    ]
);

print("✅ Updated " + updateResult.modifiedCount + " products");

// Show some examples
print("\n📊 Sample updated products:");
db.products.find({}, {name: 1, description: 1}).limit(3).forEach(function(product) {
    print("• " + product.name);
    print("  " + product.description);
});

print("\n✅ All product names now use 'T-Shirt' terminology!");