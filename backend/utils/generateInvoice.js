import PDFDocument from "pdfkit";


function generateInvoicePdf(order, res) {
  const doc = new PDFDocument({ margin: 50 });

 
  doc.pipe(res);

  doc.fontSize(20).text("FoodExpress", { align: "left" });
  doc.fontSize(10).fillColor("gray").text("Invoice", { align: "left" });
  doc.moveDown(2);


  doc.fillColor("black").fontSize(12);
  doc.text(`Invoice for Order #${order._id.toString().slice(-6).toUpperCase()}`);
  doc.text(`Date: ${new Date(order.createdAt).toLocaleDateString()}`);
  doc.text(`Restaurant: ${order.restaurant.name}`);
  doc.text(`Customer: ${order.user.name}`);
  doc.text(`Delivery Address: ${order.deliveryAddress}`);
  doc.moveDown(1.5);


  const tableTop = doc.y;
  doc.font("Helvetica-Bold");
  doc.text("Item", 50, tableTop);
  doc.text("Qty", 300, tableTop);
  doc.text("Price", 370, tableTop);
  doc.text("Total", 450, tableTop);
  doc.font("Helvetica");
  doc.moveDown(0.5);
  doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke(); 
  doc.moveDown(0.5);

  
  order.items.forEach((item) => {
    const rowY = doc.y;
    doc.text(item.name, 50, rowY);
    doc.text(item.quantity.toString(), 300, rowY);
    doc.text(`Rs. ${item.price}`, 370, rowY);
    doc.text(`Rs. ${item.price * item.quantity}`, 450, rowY);
    doc.moveDown(0.8);
  });

  doc.moveDown(0.5);
  doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
  doc.moveDown(0.5);

  
  doc.font("Helvetica-Bold").fontSize(13);
  doc.text(`Total: Rs. ${order.totalAmount}`, { align: "right" });

  doc.moveDown(2);
  doc.font("Helvetica").fontSize(10).fillColor("gray");
  doc.text("Payment Method: Cash on Delivery", { align: "left" });
  doc.text("Thank you for ordering with FoodExpress!", { align: "left" });


  doc.end();
}

export default generateInvoicePdf;