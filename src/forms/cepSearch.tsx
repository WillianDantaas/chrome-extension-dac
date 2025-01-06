import React, { useState, useEffect } from "react";
import { SearchButton } from "../components/Buttons";
import { useCepContext } from "../contexts/CepContext";

// Restrições
import { restrictions } from "../utils/restrictionsDatabase";

// Cidades atendidas
import { servicedCities } from "../data/servicedCities";

export function SearchCityForm() {
    const [cep, setCep] = useState("");
    const { cepData, fetchCepData } = useCepContext();
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");

    const handleSearch = async () => {
        setLoading(true);
        setMessage(""); // Resetar mensagem ao iniciar uma nova busca

        if (cep) {
            try {
                await fetchCepData(cep);
            } catch (error) {
                console.log(error);
                setMessage("Erro ao buscar informações do CEP.");
            } finally {
                setLoading(false);
            }
        }
    };

    useEffect(() => {
        if (!cepData) return;

        const cityFromApi = cepData.city;
        const neighborhoodFromApi = cepData.neighborhood;
        const streetFromApi = cepData.street;
        const cepPrefix = cep.slice(0, 3); // Obtendo os 3 primeiros dígitos do CEP

        // Verificar se a cidade está na base de dados
        const cityInDatabase = servicedCities.some(
            (city) => city.city.toLowerCase() === cityFromApi.toLowerCase()
        );

        if (!cityInDatabase) {
            setMessage("Infelizmente, não atendemos sua cidade.");
            return;
        }

        // Verificar restrições de CEP (com base nos 3 primeiros dígitos)
        if (restrictions.restrictedCeps.includes(cepPrefix)) {
            setMessage("Infelizmente, a área do seu CEP está restrita.");
            return;
        }

        // Verificar se o bairro é restrito
        if (restrictions.restrictedNeighborhoods.includes(neighborhoodFromApi)) {
            setMessage("Infelizmente, o bairro informado está restrito.");
            return;
        }

        // Verificar se a rua é restrita
        if (
            restrictions.restrictedStreets.some((street) =>
                streetFromApi.toLowerCase().includes(street.toLowerCase())
            )
        ) {
            setMessage("Infelizmente, a rua informada está restrita.");
            return;
        }

        // Se todas as validações passarem
        setMessage("Estamos atendendo sua cidade!");
    }, [cepData, cep]);

    return (
        <>
            <div className="w-[500px] border-2 rounded-lg border-indigo-500 p-3 dark:bg-gray-900 mx-auto">
                <div className="text-center mb-3">
                    <h1 className="text-gray-900 dark:text-white">
                        Cidades Atendidas - Danúbio Azul Cargas
                    </h1>
                </div>

                <form
                    className="max-w-md mx-auto"
                    onSubmit={(e) => {
                        e.preventDefault();
                        handleSearch();
                    }}
                >
                    <label
                        htmlFor="default-search"
                        className="mb-2 text-sm font-medium text-gray-900 sr-only dark:text-white"
                    >
                        Search
                    </label>
                    <div className="relative">
                        <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
                            <svg
                                className="w-4 h-4 text-gray-500 dark:text-gray-400"
                                aria-hidden="true"
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 20 20"
                            >
                                <path
                                    stroke="currentColor"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"
                                />
                            </svg>
                        </div>
                        <input
                            type="search"
                            id="default-search"
                            className="block w-full p-4 ps-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                            placeholder="Digite o CEP"
                            maxLength={8}
                            required
                            value={cep}
                            onChange={(e) => setCep(e.target.value)}
                        />
                        <SearchButton loading={loading} />
                    </div>
                </form>

                {message && (
                    <div className="mt-4 p-4 rounded-lg max-w-md mx-auto text-gray-900 dark:text-white">
                        <h3 className="text-lg font-semibold">Resultados:</h3>
                        {cepData && (
                            <>
                                <p>Cidade: {cepData.city}</p>
                                <p>Bairro: {cepData.neighborhood}</p>
                            </>
                        )}
                        <p className="font-bold text-center text-xl">{message}</p>
                    </div>
                )}

            </div>
        </>
    );
}
