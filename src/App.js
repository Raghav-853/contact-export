import React, { useState } from "react";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import "./App.css";
import image from "./image.jpeg";

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

      // Add a Name field by combining First Name and Last Name
      const processedContacts = json.map((contact) => ({
        ...contact,
        Name: `${contact["First Name"] || ""} ${
          contact["Last Name"] || ""
        }`.trim(), // Combine and trim extra spaces
      }));

      setContacts(processedContacts);
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
      <p>
        steps to export contacts: <br />
        1. click on the link:{" "}
        <a href="https://contacts.google.com/">
          Export Contacts (click/tap here)
        </a>{" "}
        <br />
        2. click on the "Export" button(Image) <br />
        <hr />
        <img src={image} alt="Reload the page" height="80" width="300" />
        <br />
        <hr />
        3. select "Google CSV format" <br />
        4. click on the "Export" button <br />
        5. upload the downloaded file here
      </p>
      <hr />
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
                    <li
                      key={`${name}-${phone}-${phone2}`}
                      className="contact-item"
                    >
                      <label>
                        <input
                          type="checkbox"
                          checked={false} // Always unchecked in the unselected list
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
                    <li
                      key={`${name}-${phone}-${phone2}`}
                      className="contact-item"
                    >
                      <label>
                        <input
                          type="checkbox"
                          checked={true} // Always checked in the selected list
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
