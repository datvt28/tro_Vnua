'use client';

import { getProvince } from '@/api/api';
import React, { useEffect, useRef, useState } from 'react';

interface Props {
    setLocation: React.Dispatch<React.SetStateAction<string>>;
}

type Ward = {
    name: string;
    mergedFrom?: string[];
};

type Province = {
    province: string;
    wards: Ward[];
};

function LocationInput({ setLocation }: Props) {
    const [provinces, setProvinces] = useState<Province[]>([]);
    const [filteredProvinces, setFilteredProvinces] = useState<Province[]>([]);
    const [wards, setWards] = useState<Ward[]>([]);
    const [filteredWards, setFilteredWards] = useState<Ward[]>([]);

    const provinceInputRef = useRef<HTMLInputElement>(null);
    const wardInputRef = useRef<HTMLInputElement>(null);
    const dropdownProvinceRef = useRef<HTMLDivElement>(null);
    const dropdownWardRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const fetchData = async () => {
            const res = await getProvince();
            if (res?.data?.data) {
                setProvinces(res.data.data);
                setFilteredProvinces(res.data.data);
            }
        };
        fetchData();
    }, []);

    const handleProvinceSearch = (
        event: React.ChangeEvent<HTMLInputElement>
    ) => {
        const query = event.target.value.toLowerCase();
        const filtered = provinces.filter((p) =>
            p.province.toLowerCase().includes(query)
        );
        setFilteredProvinces(filtered);
    };

    const handleProvinceSelect = (selected: Province) => {
        if (provinceInputRef.current && dropdownProvinceRef.current) {
            provinceInputRef.current.value = selected.province;
            dropdownProvinceRef.current.classList.add('hidden');
        }

        setWards(selected.wards);
        setFilteredWards(selected.wards);

        if (wardInputRef.current) {
            wardInputRef.current.value = '';
        }

        setLocation('');
    };

    const handleWardSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
        const query = event.target.value.toLowerCase();
        const filtered = wards.filter((w) =>
            w.name.toLowerCase().includes(query)
        );
        setFilteredWards(filtered);
    };

    const handleWardSelect = (selectedWard: Ward) => {
        if (wardInputRef.current && dropdownWardRef.current) {
            wardInputRef.current.value = selectedWard.name;
            dropdownWardRef.current.classList.add('hidden');
        }

        if (provinceInputRef.current) {
            const provinceName = provinceInputRef.current.value;
            const fullAddress = `${selectedWard.name}, ${provinceName}`;
            setLocation(fullAddress);
        }
    };

    return (
        <div className="grid grid-cols-2 mt-2 gap-3">
            <div className="col-span-1">
                <div>Tỉnh, thành phố:</div>
                <div className="relative">
                    <input
                        ref={provinceInputRef}
                        className="px-2 mt-1 py-1 border-2 w-full rounded-[10px] outline-none"
                        type="text"
                        placeholder="VD: Thành phố Hà Nội"
                        onChange={handleProvinceSearch}
                        onBlur={() => {
                            setTimeout(() => {
                                dropdownProvinceRef.current?.classList.add(
                                    'hidden'
                                );
                            }, 100);
                        }}
                        onClick={() => {
                            dropdownProvinceRef.current?.classList.remove(
                                'hidden'
                            );
                        }}
                    />
                    <div
                        ref={dropdownProvinceRef}
                        className="absolute hidden overflow-y-auto w-full max-h-[9.7rem] top-[-9.7rem] shadow-custom-light bg-white border-2 rounded outline-none z-10"
                    >
                        {filteredProvinces.map((province, index) => (
                            <div
                                className="hover:bg-blue-500 px-2 py-1 hover:text-white cursor-pointer"
                                key={index}
                                onClick={() => handleProvinceSelect(province)}
                            >
                                {province.province}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="col-span-1">
                <div>Xã, thị trấn:</div>
                <div className="relative">
                    <input
                        ref={wardInputRef}
                        className="px-2 mt-1 py-1 border-2 w-full rounded-[10px] outline-none"
                        type="text"
                        placeholder="VD: Thị trấn Trâu Quỳ"
                        onChange={handleWardSearch}
                        onBlur={() => {
                            setTimeout(() => {
                                dropdownWardRef.current?.classList.add(
                                    'hidden'
                                );
                            }, 100);
                        }}
                        onClick={() => {
                            dropdownWardRef.current?.classList.remove('hidden');
                        }}
                    />
                    <div
                        ref={dropdownWardRef}
                        className="absolute overflow-y-auto hidden w-full max-h-[9.7rem] top-[-9.7rem] shadow-custom-light bg-white border-2 rounded outline-none z-10"
                    >
                        {filteredWards.map((ward, index) => (
                            <div
                                className="hover:bg-blue-500 px-2 py-1 hover:text-white cursor-pointer"
                                key={index}
                                onClick={() => handleWardSelect(ward)}
                            >
                                {ward.name}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default LocationInput;
