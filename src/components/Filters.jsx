import { useState, useRef, useEffect } from "react";
import Button from "./Button";
import Select from "./Select";
import Input from "./Input";
import { ListFilter, X } from "lucide-react";
import { formatDateWithDay } from "../utils";

export default function Filters({ fields, data = [], onFiltered, onFilterStateChange }) {
    const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
    const panelRef = useRef(null);

    // Initialize state from field names
    const initialState = {};
    fields.forEach((f) => (initialState[f.name] = ""));
    const [values, setValues] = useState(initialState);

    const updateValue = (name, newValue) => {
        const updated = { ...values, [name]: newValue };
        setValues(updated);
    };

    const clearAllFilters = () => {
        const cleared = {};
        fields.forEach((f) => (cleared[f.name] = ""));
        setValues(cleared);
    };

    // 🔥 FILTERING LOGIC HERE
    useEffect(() => {
        if (!data.length) {
            onFiltered?.([], false);
            return;
        }

        let filtered = [...data];

        fields.forEach((field) => {
            const userValue = values[field.name]?.toString().trim().toLowerCase();
            if (!userValue) return;

            const key = field.field || field.name;

            filtered = filtered.filter((row) => {
                const rowValue = (row[key]?.toString().toLowerCase()) || "";

                if (field.type === "select") {
                    // exact match for select fields
                    return rowValue === userValue;
                } else if (field.type === "date") {
                    const inputDate = formatDateWithDay(userValue); // "17-11-2025, Mon"
                    const rowDate = row[key]; // "17-11-2025, Mon"
                    return rowDate === inputDate;
                } else {
                    // substring match for text fields
                    return rowValue.includes(userValue);
                }
            });
        });

        const isActive = Object.values(values).some((v) => v !== "");

        onFiltered?.(filtered, isActive);
    }, [values, data]);

    return (
        <div className="filters">
            <Button
                onClick={() => setIsFilterModalOpen(true)}
                className="flex items-center"
            >
                <ListFilter className="mr-2 h-4 w-4" />
                Filter
            </Button>

            <div
                onClick={() => setIsFilterModalOpen(false)}
                className={`fixed inset-0 bg-black/30 backdrop-blur-[1px] transition-opacity duration-300 z-60 ${isFilterModalOpen
                    ? "opacity-100 pointer-events-auto"
                    : "opacity-0 pointer-events-none"
                    }`}
            />

            <div
                ref={panelRef}
                className={`h-screen w-96 p-2 pl-0 fixed top-0 -right-100 transform transition-transform duration-300 ease-in-out z-70 ${isFilterModalOpen ? "right-0" : ""
                    }`}
            >
                <div className="w-full h-full bg-[#f8fbfb] drop-shadow-md border border-r-0 border-gray-300 rounded-2xl flex flex-col p-2">
                    <div className="flex justify-between items-center px-3 py-2 border-b border-gray-200">
                        <h2 className="text-lg font-semibold">Filter Options</h2>
                        <button
                            className="text-gray-500 hover:text-gray-700"
                            onClick={() => setIsFilterModalOpen(false)}
                        >
                            <X size={16} />
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto space-y-3 py-3 px-4">
                        <div className="grid grid-cols-1 gap-4 mb-6">
                            {fields.map((field, index) => (
                                <div key={index}>
                                    {field.type === "select" ? (
                                        <Select
                                            label={field.label}
                                            value={values[field.name]}
                                            onChange={(val) => updateValue(field.name, val)}
                                            options={field.options || []}
                                            placeholder={`Select ${field.label.toLowerCase()}`}
                                        />
                                    ) : (
                                        <Input
                                            label={field.label}
                                            type={field.type}
                                            value={values[field.name]}
                                            onChange={(e) =>
                                                updateValue(field.name, e.target.value)
                                            }
                                            placeholder={`Enter ${field.label.toLowerCase()}`}
                                        />
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="px-4 py-3 border-t border-gray-200 grid grid-cols-2 gap-2">
                        <Button variant="secondary-btn" onClick={() => setIsFilterModalOpen(false)}>Close</Button>
                        <Button variant="red-btn" onClick={clearAllFilters}>Clear</Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
