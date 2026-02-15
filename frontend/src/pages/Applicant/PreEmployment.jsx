import React, { useState, useEffect } from "react";
import Input from "../../components/Input";
import UploadBox from "../../components/UploadBox";
import Button from "../../components/Button";
import { preEmploymentApi } from "../../api/preEmploymentApi";

const PreEmployment = () => {
  // Personal Identifiers State
  const [identifiers, setIdentifiers] = useState({
    sss: "",
    philhealth: "",
    tin: "",
    pagibig: "",
  });

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  // File States (stores File objects for new uploads)
  const [files, setFiles] = useState({
    photo2x2: null,
    coe: null,
    marriageContract: null,
    prcLicense: null,
    civilService: null,
    mastersUnits: null,
    car: null,
    tor: null,
    certificates: null,
  });

  // Existing Files State (stores URLs from backend)
  const [existingFiles, setExistingFiles] = useState({
    photo2x2: null,
    coe: null,
    marriageContract: null,
    prcLicense: null,
    civilService: null,
    mastersUnits: null,
    car: null,
    tor: null,
    certificates: null,
  });

  const [existingTesdaFiles, setExistingTesdaFiles] = useState([]);

  // Multiple Files State (new uploads)
  const [tesdaFiles, setTesdaFiles] = useState([]);

  // Preview State for 2x2 Photo
  const [photoPreview, setPhotoPreview] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await preEmploymentApi.get();
        if (response && response.data) {
          const data = response.data;
          setIdentifiers({
            sss: data.sss || "",
            philhealth: data.philhealth || "",
            tin: data.tin || "",
            pagibig: data.pagibig || "",
          });

          // Set existing file URLs
          setExistingFiles({
            photo2x2: data.photo2x2,
            coe: data.coe,
            marriageContract: data.marriageContract,
            prcLicense: data.prcLicense,
            civilService: data.civilService,
            mastersUnits: data.mastersUnits,
            car: data.car,
            tor: data.tor,
            certificates: data.otherCert,
          });

          if (data.photo2x2) {
            setPhotoPreview(data.photo2x2);
          }

          if (data.tesdaCerts) {
            try {
              setExistingTesdaFiles(JSON.parse(data.tesdaCerts));
            } catch (e) {
              setExistingTesdaFiles([]);
            }
          }
        }
      } catch (error) {
        console.error("Failed to fetch pre-employment data", error);
      } finally {
        setFetching(false);
      }
    };
    fetchData();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setIdentifiers((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileChange = (e, key) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (key !== "photo2x2" && file.type !== "application/pdf") {
        alert("Invalid file type. Only PDF files are allowed.");
        return;
      }

      setFiles((prev) => ({
        ...prev,
        [key]: file,
      }));

      // Create preview for 2x2 photo
      if (key === "photo2x2") {
        const reader = new FileReader();
        reader.onloadend = () => {
          setPhotoPreview(reader.result);
        };
        reader.readAsDataURL(file);
      }
    }
  };

  // Handle multiple file uploads for TESDA
  const handleTesdaUpload = (e) => {
    const newFiles = Array.from(e.target.files);
    // Validate PDF only
    const invalidFiles = newFiles.filter((f) => f.type !== "application/pdf");
    if (invalidFiles.length > 0) {
      alert("Some files have invalid types. Only PDF files are allowed.");
      return;
    }
    setTesdaFiles((prev) => [...prev, ...newFiles]);
  };

  const removeFile = (key) => {
    setFiles((prev) => ({
      ...prev,
      [key]: null,
    }));
    if (key === "photo2x2") {
      setPhotoPreview(existingFiles.photo2x2 || null);
    }
  };

  const removeTesdaFile = (index) => {
    setTesdaFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleClear = async () => {
    if (
      window.confirm(
        "Are you sure you want to PERMANENTLY remove all uploaded records and documents from our system? This action cannot be undone.",
      )
    ) {
      setLoading(true);
      try {
        await preEmploymentApi.clear();
        alert("All pre-employment records have been cleared.");

        // Reset all states
        setIdentifiers({
          sss: "",
          philhealth: "",
          tin: "",
          pagibig: "",
        });
        setFiles({
          photo2x2: null,
          coe: null,
          marriageContract: null,
          prcLicense: null,
          civilService: null,
          mastersUnits: null,
          car: null,
          tor: null,
          certificates: null,
        });
        setExistingFiles({
          photo2x2: null,
          coe: null,
          marriageContract: null,
          prcLicense: null,
          civilService: null,
          mastersUnits: null,
          car: null,
          tor: null,
          certificates: null,
        });
        setTesdaFiles([]);
        setExistingTesdaFiles([]);
        setPhotoPreview(null);
      } catch (error) {
        console.error("Failed to clear records:", error);
        alert("Failed to clear records. Please try again.");
      } finally {
        setLoading(false);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await preEmploymentApi.save(identifiers, files, tesdaFiles);
      alert("Pre-employment requirements saved successfully!");
      // Optionally refresh data to show updated URLs
      const response = await preEmploymentApi.get();
      if (response?.data) {
        // Update local state with new data if needed
        window.location.reload();
      }
    } catch (error) {
      console.error(error);
      alert("Failed to save requirements. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const renderSectionHeader = (title, subtitle) => (
    <div className="mb-4 text-left">
      <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
      {subtitle && <p className="text-sm text-gray-600 mt-1">{subtitle}</p>}
    </div>
  );

  const getStatusBadge = (key, required = false) => {
    if (files[key]) return "Selected";
    if (existingFiles[key]) return "Uploaded";
    return required ? "Required" : "Optional";
  };

  const getFileNameFromUrl = (url = "", fallback = "file.pdf") => {
    try {
      const cleanUrl = url.split("?")[0];
      const name = cleanUrl.substring(cleanUrl.lastIndexOf("/") + 1);
      return name || fallback;
    } catch (err) {
      console.error("Failed to derive filename", err);
      return fallback;
    }
  };

  const handleDownloadFile = async (e, url, fallbackName) => {
    e.preventDefault();
    if (!url) return;

    const filename = getFileNameFromUrl(url, `${fallbackName || "file"}.pdf`);

    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error("Network response was not ok");

      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(blobUrl);
    } catch (err) {
      console.error("Download failed; opening in new tab", err);
      window.open(url, "_blank", "noopener,noreferrer");
    }
  };

  if (fetching)
    return <div className="p-8 text-center">Loading requirements...</div>;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-2">Pre-Employment Requirements</h1>
      <p className="text-gray-600 mb-8">
        Please complete the form below and upload the necessary documents.
      </p>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* 1. 2x2 Picture (Formal) */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
          {renderSectionHeader(
            "2x2 ID Picture",
            "Upload a formal 2x2 picture with white background.",
          )}

          <div className="flex flex-col md:flex-row gap-6 items-start">
            <div className="w-full md:w-2/3">
              <UploadBox
                id="photo-upload"
                label="Click to upload 2x2 picture"
                accept="image/*"
                onChange={(e) => handleFileChange(e, "photo2x2")}
                file={files.photo2x2}
                onRemove={() => removeFile("photo2x2")}
                statusBadge={getStatusBadge("photo2x2", true)}
                subtitle="JPG, PNG up to 5MB"
                variant={existingFiles.photo2x2 ? "success" : "neutral"}
              />
              {existingFiles.photo2x2 && !files.photo2x2 && (
                <p className="mt-2 text-sm text-green-600">
                  ✓ Current photo uploaded.
                </p>
              )}
            </div>

            {/* Preview Area */}
            <div className="w-full md:w-1/3 flex flex-col items-center justify-center p-4 bg-gray-50 rounded-lg border border-dashed border-gray-300 min-h-[200px]">
              {photoPreview ? (
                <div className="relative">
                  <img
                    src={photoPreview}
                    alt="2x2 Preview"
                    className="w-32 h-32 object-cover rounded-md shadow-md border border-gray-200"
                  />
                  <p className="text-xs text-gray-500 mt-2 text-center">
                    Preview
                  </p>
                </div>
              ) : (
                <div className="text-center text-gray-400">
                  <svg
                    className="w-16 h-16 mx-auto mb-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="1"
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  <span className="text-sm">No image selected</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 2. Government Numbers */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
          {renderSectionHeader("Government Identification Numbers")}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="SSS Number"
              name="sss"
              placeholder="00-0000000-0"
              value={identifiers.sss}
              onChange={handleInputChange}
            />
            <Input
              label="PhilHealth Number"
              name="philhealth"
              placeholder="00-000000000-0"
              value={identifiers.philhealth}
              onChange={handleInputChange}
            />
            <Input
              label="TIN (Tax Identification Number)"
              name="tin"
              placeholder="000-000-000-000"
              value={identifiers.tin}
              onChange={handleInputChange}
            />
            <Input
              label="PAG-IBIG / HDMF Number"
              name="pagibig"
              placeholder="0000-0000-0000"
              value={identifiers.pagibig}
              onChange={handleInputChange}
            />
          </div>
        </div>

        {/* 3. Uploads Section */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
          {renderSectionHeader(
            "Document Uploads",
            "Upload clear copies of the following documents (Optional).",
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Helper to render UploadBox with existing file link */}
            {[
              {
                key: "coe",
                label: "Certificate of Employment (Previous Employment)",
                id: "coe-upload",
              },
              {
                key: "marriageContract",
                label: "PSA Marriage Contract",
                id: "marriage-upload",
              },
              { key: "prcLicense", label: "PRC License", id: "prc-upload" },
              {
                key: "civilService",
                label: "Civil Service Eligibility",
                id: "civil-upload",
              },
              {
                key: "mastersUnits",
                label: "Masters Earned Units",
                id: "masters-upload",
              },
              {
                key: "car",
                label: "Complete Academic Requirements (CAR)",
                id: "car-upload",
              },
              {
                key: "tor",
                label: "Official Transcripts of Records (TOR)",
                id: "tor-upload",
              },
              {
                key: "certificates",
                label: "Other Certificates",
                id: "certs-upload",
              },
            ].map((doc) => (
              <div
                key={doc.key}
                className={doc.key === "coe" ? "col-span-1 md:col-span-2" : ""}
              >
                <h3 className="text-sm font-medium text-gray-700 mb-2">
                  {doc.label}
                </h3>
                <UploadBox
                  id={doc.id}
                  onChange={(e) => handleFileChange(e, doc.key)}
                  file={files[doc.key]}
                  onRemove={() => removeFile(doc.key)}
                  label={`Click to upload ${doc.label}`}
                  statusBadge={getStatusBadge(doc.key)}
                  variant={existingFiles[doc.key] ? "success" : "neutral"}
                  accept=".pdf"
                  subtitle="PDF up to 10MB"
                />
                {existingFiles[doc.key] && (
                  <div className="mt-1 flex items-center text-sm gap-3">
                    <span className="text-green-600">✓ Uploaded</span>
                    <a
                      href={existingFiles[doc.key]}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      View Current
                    </a>
                    <a
                      href={existingFiles[doc.key]}
                      onClick={(e) =>
                        handleDownloadFile(e, existingFiles[doc.key], doc.label)
                      }
                      className="text-blue-600 hover:underline"
                    >
                      Download
                    </a>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* 4. TESDA National Certificates (Multiple) */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
          {renderSectionHeader(
            "TESDA National Certificates",
            "You can upload multiple certificates.",
          )}

          <UploadBox
            id="tesda-upload"
            label="Click to upload TESDA Certificates"
            onChange={handleTesdaUpload}
            files={tesdaFiles}
            onRemove={removeTesdaFile}
            statusBadge="Optional"
            subtitle="PDF up to 10MB"
            accept=".pdf"
          />

          {existingTesdaFiles.length > 0 && (
            <div className="mt-4">
              <h4 className="text-sm font-medium text-gray-700 mb-2">
                Previously Uploaded Certificates:
              </h4>
              <ul className="list-disc list-inside text-sm text-blue-600">
                {existingTesdaFiles.map((url, idx) => (
                  <li key={idx}>
                    <div className="flex items-center gap-3">
                      <a
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:underline"
                      >
                        Certificate {idx + 1}
                      </a>
                      <a
                        href={url}
                        onClick={(e) =>
                          handleDownloadFile(
                            e,
                            url,
                            `TESDA_Certificate_${idx + 1}`,
                          )
                        }
                        className="text-blue-600 hover:underline"
                      >
                        Download
                      </a>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <Button
            onClick={handleClear}
            variant="outline"
            size="lg"
            disabled={loading}
          >
            Clear Selected Files
          </Button>
          <Button
            onClick={handleSubmit}
            variant="primary"
            size="lg"
            disabled={loading}
          >
            {loading ? "Saving..." : "Submit Requirements"}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default PreEmployment;
