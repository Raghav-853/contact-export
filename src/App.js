import React, { useState } from "react";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import "./App.css";

const App = () => {
  const [contacts, setContacts] = useState([]);
  const [selectedContacts, setSelectedContacts] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    const reader = new FileReader();

    reader.onload = (e) => {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: "array" });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const json = XLSX.utils.sheet_to_json(worksheet);
      setContacts(json);
    };

    reader.readAsArrayBuffer(file);
  };

  const handleContactSelection = (contact) => {
    setSelectedContacts((prev) => [...prev, contact]);
    setContacts((prev) => prev.filter((item) => item !== contact));
  };

  const handleDeselectContact = (contact) => {
    setContacts((prev) => [...prev, contact]);
    setSelectedContacts((prev) => prev.filter((item) => item !== contact));
  };

  const handleExport = () => {
    const exportData = selectedContacts.map((contact) => ({
      Name: contact["Name"] || "Unknown",
      "Phone 1 - Value": contact["Phone 1 - Value"] || "N/A",
      "Phone 2 - Value": contact["Phone 2 - Value"] || "N/A",
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Selected Contacts");

    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });
    const blob = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(blob, "selected_contacts.xlsx");
  };

  const filteredContacts = contacts.filter((contact) => {
    const name = contact["Name"] || "Unknown";
    const phone =
      contact["Phone 1 - Value"] || contact["Phone 2 - Value"] || "N/A";
    return (
      name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      phone.toString().toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  return (
    <div className="app-container">
      <h1>Contact Selector</h1>
      <input type="file" accept=".csv, .xlsx" onChange={handleFileUpload} />

      {contacts.length > 0 || selectedContacts.length > 0 ? (
        <>
          <div className="stats-container">
            <p>
              Selected Contacts: {selectedContacts.length} /{" "}
              {contacts.length + selectedContacts.length}
            </p>
            <input
              type="text"
              placeholder="Search by name or phone"
              className="search-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <button
            onClick={handleExport}
            className="export-button"
            disabled={selectedContacts.length === 0}
          >
            Export Selected Contacts
          </button>
          <div className="columns">
            <div className="column">
              <h2>Unselected Contacts</h2>
              <ul className="contact-list">
                {filteredContacts.map((contact, index) => {
                  const name = contact["Name"] || "Unknown";
                  const phone = contact["Phone 1 - Value"] || "N/A";
                  const phone2 = contact["Phone 2 - Value"] || "N/A";
                  return (
                    <li key={index} className="contact-item">
                      <label>
                        <input
                          type="checkbox"
                          onChange={() => handleContactSelection(contact)}
                        />
                        <span>
                          {name} - {phone} - {phone2}
                        </span>
                      </label>
                    </li>
                  );
                })}
              </ul>
            </div>
            <div className="column">
              <h2>Selected Contacts</h2>
              <ul className="contact-list">
                {selectedContacts.map((contact, index) => {
                  const name = contact["Name"] || "Unknown";
                  const phone = contact["Phone 1 - Value"] || "N/A";
                  const phone2 = contact["Phone 2 - Value"] || "N/A";
                  return (
                    <li key={index} className="contact-item">
                      <label>
                        <input
                          type="checkbox"
                          checked
                          onChange={() => handleDeselectContact(contact)}
                        />
                        <span>
                          {name} - {phone} - {phone2}
                        </span>
                      </label>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
};

export default App;
