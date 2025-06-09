import { faker } from "@faker-js/faker";
import { setSeederFactory } from "typeorm-extension";
import { ProductImage } from "src/product-images/entities/product-image.entity";

export const ProductImageFactory = setSeederFactory(ProductImage, () => {
    const productImage = new ProductImage();
    productImage.image_name = faker.image.urlLoremFlickr({ category: 'food' })
    return productImage;
});