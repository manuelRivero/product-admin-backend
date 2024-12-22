const finalPrice = (price, percentage) => {
  if (price <= 0) {
    throw new Error("El precio original debe ser mayor a 0");
  }
  if (percentage < 0 || percentage > 100) {
    throw new Error("El porcentaje de descuento debe estar entre 0 y 100");
  }

  const discount = (price * percentage) / 100;
  const finalPrice = price - discount;
  return parseFloat(finalPrice.toFixed(2)); // Redondea a 2 decimales
}
 module.exports ={
    finalPrice
 }