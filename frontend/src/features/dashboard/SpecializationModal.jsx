import React, { useState, useEffect } from "react";
import { FaTrash } from "react-icons/fa";
import Modal from "../../components/Modal";
import Input from "../../components/Input";
import Button from "../../components/Button";
import { specializationApi } from "../../api/specializationApi";

const SpecializationModal = ({ isOpen, onClose }) => {
  const [specializations, setSpecializations] = useState([]);
  const [newSpecialization, setNewSpecialization] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen) {
      loadSpecializations();
    }
  }, [isOpen]);

  const loadSpecializations = async () => {
    setLoading(true);
    try {
      const response = await specializationApi.getSpecializations();
      if (response && response.data) {
        setSpecializations(response.data);
      }
    } catch (err) {
      setError("Failed to load specializations");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async () => {
    if (!newSpecialization.trim()) return;

    setLoading(true);
    setError(null);
    try {
      const response =
        await specializationApi.createSpecialization(newSpecialization);
      if (response && response.data) {
        setSpecializations([...specializations, response.data]);
        setNewSpecialization("");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to add specialization");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this specialization?"))
      return;

    setLoading(true);
    setError(null);
    try {
      await specializationApi.deleteSpecialization(id);
      setSpecializations(specializations.filter((s) => s.id !== id));
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to delete specialization",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Manage Specializations"
      size="md"
    >
      <div className="space-y-4">
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
            {error}
          </div>
        )}

        <div className="flex gap-2">
          <div className="flex-grow">
            <Input
              value={newSpecialization}
              onChange={(e) => setNewSpecialization(e.target.value)}
              placeholder="Enter new specialization"
              disabled={loading}
            />
          </div>
          <Button
            onClick={handleAdd}
            disabled={loading || !newSpecialization.trim()}
          >
            {loading ? "Adding..." : "Add"}
          </Button>
        </div>

        <div className="mt-4">
          <h4 className="font-semibold mb-2">Existing Specializations</h4>
          {loading && specializations.length === 0 ? (
            <p className="text-gray-500">Loading...</p>
          ) : specializations.length > 0 ? (
            <ul className="divide-y divide-gray-200 border rounded-md">
              {specializations.map((spec) => (
                <li
                  key={spec.id}
                  className="p-3 hover:bg-gray-50 flex justify-between items-center group"
                >
                  <span>{spec.name}</span>
                  <button
                    onClick={() => handleDelete(spec.id)}
                    className="text-red-500 hover:text-red-700 p-2"
                    title="Delete specialization"
                  >
                    <FaTrash size={14} />
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500 italic">No specializations found.</p>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default SpecializationModal;
