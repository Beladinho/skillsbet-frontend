import { useEffect, useState } from "react";
import { getMyKyc, submitKyc } from "../api/skillsbetApi";
import { useNotifications } from "../context/NotificationContext";
import { useSounds } from "../context/SoundContext";

export default function KycPanel() {
  const { notifySuccess, notifyError } = useNotifications();
  const { playClick } = useSounds();

  const [kyc, setKyc] = useState(null);
  const [fullName, setFullName] = useState("");
  const [country, setCountry] = useState("");
  const [documentType, setDocumentType] = useState("passport");
  const [documentReference, setDocumentReference] = useState("");

  useEffect(() => {
    loadKyc();
  }, []);

  async function loadKyc() {
    try {
      const data = await getMyKyc();
      setKyc(data);

      setFullName(data.full_name || "");
      setCountry(data.country || "");
      setDocumentType(data.document_type || "passport");
      setDocumentReference(data.document_reference || "");
    } catch (error) {
      console.error(error);
      notifyError("KYC", error.message || "Impossible de charger le statut KYC.");
    }
  }

  async function handleSubmit() {
    try {
      await submitKyc({
        fullName,
        country,
        documentType,
        documentReference,
      });

      await loadKyc();
      notifySuccess("KYC", "KYC submitted successfully.");
    } catch (error) {
      console.error(error);
      notifyError("KYC", error.message || "Impossible de soumettre le KYC.");
    }
  }

  return (
    <div className="card" style={{ marginTop: "24px", padding: "16px" }}>
      <h3>KYC Verification</h3>

      <p>
        <strong>Status :</strong> {kyc?.status || "not_started"}
      </p>

      {kyc?.admin_note ? (
        <p>
          <strong>Admin note :</strong> {kyc.admin_note}
        </p>
      ) : null}

      <div style={{ marginTop: "12px" }}>
        <label>Full name</label>
        <br />
        <input
          type="text"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
        />
      </div>

      <div style={{ marginTop: "12px" }}>
        <label>Country</label>
        <br />
        <input
          type="text"
          value={country}
          onChange={(e) => setCountry(e.target.value)}
        />
      </div>

      <div style={{ marginTop: "12px" }}>
        <label>Document type</label>
        <br />
        <select
          value={documentType}
          onChange={(e) => setDocumentType(e.target.value)}
        >
          <option value="passport">Passport</option>
          <option value="id_card">ID Card</option>
          <option value="driving_license">Driving License</option>
        </select>
      </div>

      <div style={{ marginTop: "12px" }}>
        <label>Document reference</label>
        <br />
        <input
          type="text"
          value={documentReference}
          onChange={(e) => setDocumentReference(e.target.value)}
        />
      </div>

      <div style={{ marginTop: "16px" }}>
        <button
          onClick={() => {
            playClick();
            handleSubmit();
          }}
        >
          Submit KYC
        </button>
      </div>
    </div>
  );
}