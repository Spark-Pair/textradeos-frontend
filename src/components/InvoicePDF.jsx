// InvoicePDF.jsx
import React from "react";
import {
  Page,
  Text,
  View,
  Document,
  StyleSheet,
  PDFViewer,
} from "@react-pdf/renderer";

// --------------------
// STYLES
// --------------------
const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontSize: 12,
    fontFamily: "Helvetica",
  },
  header: {
    marginBottom: 20,
    borderBottom: "1 solid #ccc",
    paddingBottom: 10,
  },
  section: {
    marginVertical: 10,
  },
  table: {
    display: "table",
    width: "auto",
    borderStyle: "solid",
    borderWidth: 1,
    borderRightWidth: 0,
    borderBottomWidth: 0,
  },
  tableRow: {
    flexDirection: "row",
  },
  tableColHeader: {
    width: "25%",
    borderStyle: "solid",
    borderBottomWidth: 1,
    borderRightWidth: 1,
    backgroundColor: "#eee",
    padding: 4,
    fontSize: 10,
  },
  tableCol: {
    width: "25%",
    borderStyle: "solid",
    borderRightWidth: 1,
    borderBottomWidth: 1,
    padding: 4,
    fontSize: 10,
  },
  title: { fontSize: 18, fontWeight: 700 },
  bold: { fontWeight: 700 },
});

// --------------------
// PDF DOCUMENT
// --------------------
const InvoiceDocument = ({ invoice }) => (
  <Document>
    <Page size="A5" style={styles.page}>
      {/* HEADER */}
      <View style={styles.header}>
        <Text style={styles.title}>INVOICE</Text>
        <Text>Invoice #: {invoice.number}</Text>
        <Text>Date: {invoice.date}</Text>
      </View>

      {/* CUSTOMER INFO */}
      <View style={styles.section}>
        <Text style={styles.bold}>Customer Information</Text>
        <Text>{invoice.customer.name}</Text>
        <Text>{invoice.customer.phone}</Text>
        <Text>{invoice.customer.address}</Text>
      </View>

      {/* ITEMS TABLE */}
      <View style={[styles.section, styles.table]}>
        <View style={styles.tableRow}>
          <Text style={styles.tableColHeader}>Item</Text>
          <Text style={styles.tableColHeader}>Qty</Text>
          <Text style={styles.tableColHeader}>Price</Text>
          <Text style={styles.tableColHeader}>Total</Text>
        </View>

        {invoice.items.map((item, i) => (
          <View style={styles.tableRow} key={i}>
            <Text style={styles.tableCol}>{item.name}</Text>
            <Text style={styles.tableCol}>{item.qty}</Text>
            <Text style={styles.tableCol}>{item.price}</Text>
            <Text style={styles.tableCol}>{item.qty * item.price}</Text>
          </View>
        ))}
      </View>

      {/* TOTALS */}
      <View style={styles.section}>
        <Text style={styles.bold}>Subtotal: {invoice.subtotal}</Text>
        <Text style={styles.bold}>Tax: {invoice.tax}</Text>
        <Text style={styles.bold}>Grand Total: {invoice.total}</Text>
      </View>
    </Page>
  </Document>
);

// --------------------
// MAIN COMPONENT (Viewer)
// --------------------
export default function InvoicePDF() {
  const invoiceMock = {
    number: "INV-001",
    date: "2025-11-20",
    customer: {
      name: "John Doe",
      phone: "0300-1234567",
      address: "Karachi, Pakistan",
    },
    items: [
      { name: "Shirt", qty: 2, price: 1200 },
      { name: "Pant", qty: 1, price: 1800 },
    ],
    subtotal: 4200,
    tax: 200,
    total: 4400,
  };

  return (
    <PDFViewer style={{ width: "100%", height: "100vh" }}>
      <InvoiceDocument invoice={invoiceMock} />
    </PDFViewer>
  );
}
