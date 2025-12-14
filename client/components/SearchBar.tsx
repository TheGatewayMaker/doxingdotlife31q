import { useState } from "react";
import { Search, ChevronDown, X } from "lucide-react";
import { GlobeIcon, ServerIcon, CloseIcon } from "@/components/Icons";
import { cn } from "@/lib/utils";

const COUNTRIES = [
  "Afghanistan",
  "Albania",
  "Algeria",
  "Andorra",
  "Angola",
  "Argentina",
  "Armenia",
  "Australia",
  "Austria",
  "Azerbaijan",
  "Bahamas",
  "Bahrain",
  "Bangladesh",
  "Barbados",
  "Belarus",
  "Belgium",
  "Belize",
  "Benin",
  "Bhutan",
  "Bolivia",
  "Bosnia and Herzegovina",
  "Botswana",
  "Brazil",
  "Brunei",
  "Bulgaria",
  "Burkina Faso",
  "Burundi",
  "Cambodia",
  "Cameroon",
  "Canada",
  "Cape Verde",
  "Central African Republic",
  "Chad",
  "Chile",
  "China",
  "Colombia",
  "Comoros",
  "Congo",
  "Costa Rica",
  "Croatia",
  "Cuba",
  "Cyprus",
  "Czech Republic",
  "Czechia",
  "Denmark",
  "Djibouti",
  "Dominica",
  "Dominican Republic",
  "East Timor",
  "Ecuador",
  "Egypt",
  "El Salvador",
  "Equatorial Guinea",
  "Eritrea",
  "Estonia",
  "Ethiopia",
  "Fiji",
  "Finland",
  "France",
  "Gabon",
  "Gambia",
  "Georgia",
  "Germany",
  "Ghana",
  "Greece",
  "Grenada",
  "Guatemala",
  "Guinea",
  "Guinea-Bissau",
  "Guyana",
  "Haiti",
  "Honduras",
  "Hungary",
  "Iceland",
  "India",
  "Indonesia",
  "Iran",
  "Iraq",
  "Ireland",
  "Israel",
  "Italy",
  "Jamaica",
  "Japan",
  "Jordan",
  "Kazakhstan",
  "Kenya",
  "Kiribati",
  "Kuwait",
  "Kyrgyzstan",
  "Laos",
  "Latvia",
  "Lebanon",
  "Lesotho",
  "Liberia",
  "Libya",
  "Liechtenstein",
  "Lithuania",
  "Luxembourg",
  "Madagascar",
  "Malawi",
  "Malaysia",
  "Maldives",
  "Mali",
  "Malta",
  "Marshall Islands",
  "Mauritania",
  "Mauritius",
  "Mexico",
  "Micronesia",
  "Moldova",
  "Monaco",
  "Mongolia",
  "Montenegro",
  "Morocco",
  "Mozambique",
  "Myanmar",
  "Namibia",
  "Nauru",
  "Nepal",
  "Netherlands",
  "New Zealand",
  "Nicaragua",
  "Niger",
  "Nigeria",
  "North Korea",
  "North Macedonia",
  "Norway",
  "Oman",
  "Pakistan",
  "Palau",
  "Palestine",
  "Panama",
  "Papua New Guinea",
  "Paraguay",
  "Peru",
  "Philippines",
  "Poland",
  "Portugal",
  "Qatar",
  "Romania",
  "Russia",
  "Rwanda",
  "Saint Kitts and Nevis",
  "Saint Lucia",
  "Saint Vincent and the Grenadines",
  "Samoa",
  "San Marino",
  "Sao Tome and Principe",
  "Saudi Arabia",
  "Senegal",
  "Serbia",
  "Seychelles",
  "Sierra Leone",
  "Singapore",
  "Slovakia",
  "Slovenia",
  "Solomon Islands",
  "Somalia",
  "South Africa",
  "South Korea",
  "South Sudan",
  "Spain",
  "Sri Lanka",
  "Sudan",
  "Suriname",
  "Sweden",
  "Switzerland",
  "Syria",
  "Taiwan",
  "Tajikistan",
  "Tanzania",
  "Thailand",
  "Togo",
  "Tonga",
  "Trinidad and Tobago",
  "Tunisia",
  "Turkey",
  "Turkmenistan",
  "Tuvalu",
  "Uganda",
  "Ukraine",
  "United Arab Emirates",
  "United Kingdom",
  "United States",
  "Uruguay",
  "Uzbekistan",
  "Vanuatu",
  "Vatican City",
  "Venezuela",
  "Vietnam",
  "Yemen",
  "Zambia",
  "Zimbabwe",
].sort();

interface SearchBarProps {
  searchQuery: string;
  selectedCountry: string;
  selectedServer: string;
  servers: string[];
  onSearchChange: (value: string) => void;
  onCountryChange: (value: string) => void;
  onServerChange: (value: string) => void;
}

export default function SearchBar({
  searchQuery,
  selectedCountry,
  selectedServer,
  servers,
  onSearchChange,
  onCountryChange,
  onServerChange,
}: SearchBarProps) {
  const [isRefineOpen, setIsRefineOpen] = useState(false);
  const [countrySearch, setCountrySearch] = useState("");
  const [serverSearch, setServerSearch] = useState("");

  const filteredCountries = COUNTRIES.filter((country) =>
    country.toLowerCase().includes(countrySearch.toLowerCase()),
  );

  const filteredServers = servers.filter((server) =>
    server.toLowerCase().includes(serverSearch.toLowerCase()),
  );

  const hasFilters = selectedCountry || selectedServer;

  return (
    <div className="space-y-4 sm:space-y-5 md:space-y-6">
      {/* Main Search Input */}
      <div
        className="relative animate-scaleUpFadeIn"
        style={{ animationDelay: "0.2s" }}
      >
        <input
          type="text"
          placeholder="Search by name, username, or details..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full px-4 sm:px-5 md:px-6 py-3 sm:py-4 md:py-4 bg-[#1a1a1a] border border-[#666666] hover:border-[#0088CC] rounded-lg md:rounded-xl text-white placeholder-[#979797] focus:outline-none focus:ring-2 focus:ring-[#0088CC] focus:border-[#0088CC] text-sm sm:text-base transition-all shadow-lg hover:shadow-[#0088CC]/30 hover:shadow-xl min-h-[44px] touch-target pr-12 sm:pr-14"
        />
        <Search className="absolute right-4 sm:right-5 md:right-6 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#979797] pointer-events-none" />
      </div>

      {/* Refine Search Dropdown Button */}
      <button
        onClick={() => setIsRefineOpen(!isRefineOpen)}
        className={cn(
          "w-full flex items-center justify-between gap-2 px-4 sm:px-5 md:px-6 py-3 sm:py-3.5 md:py-4 rounded-lg md:rounded-xl transition-all duration-200 border font-medium text-sm sm:text-base min-h-[44px] touch-target animate-slideInUp",
          isRefineOpen
            ? "bg-[#0088CC]/20 border-[#0088CC] text-[#0088CC] shadow-lg shadow-[#0088CC]/30"
            : "bg-[#1a1a1a] border-[#666666] text-[#979797] hover:border-[#0088CC] hover:bg-[#0088CC]/10",
        )}
        style={{
          animationDelay: "0.25s",
        }}
        aria-expanded={isRefineOpen}
        aria-controls="refine-section"
      >
        <span className="flex items-center gap-2">
          <span className="text-base sm:text-lg">🔍</span>
          <span>Refine Your Search</span>
          {hasFilters && (
            <span className="inline-flex items-center justify-center w-5 h-5 sm:w-6 sm:h-6 bg-[#0088CC] text-white rounded-full text-xs sm:text-sm font-bold ml-auto mr-1">
              {(selectedCountry ? 1 : 0) + (selectedServer ? 1 : 0)}
            </span>
          )}
        </span>
        <ChevronDown
          className={cn(
            "w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0 transition-transform duration-300",
            isRefineOpen && "rotate-180",
          )}
        />
      </button>

      {/* Refine Section - Collapsible */}
      <div
        id="refine-section"
        className={cn(
          "overflow-hidden transition-all duration-300 ease-in-out",
          isRefineOpen
            ? "max-h-96 sm:max-h-[500px] opacity-100 animate-slideInDown"
            : "max-h-0 opacity-0",
        )}
      >
        <div className="space-y-3 sm:space-y-4 md:space-y-5 pt-2">
          {/* Country Dropdown */}
          <div className="relative group">
            <label className="text-xs sm:text-sm font-bold text-white block mb-2 flex items-center gap-2">
              <GlobeIcon className="w-4 h-4 text-[#979797]" />
              By Country
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder={
                  selectedCountry ? selectedCountry : "Select country..."
                }
                value={countrySearch}
                onChange={(e) => setCountrySearch(e.target.value)}
                className="w-full px-4 sm:px-5 py-2.5 sm:py-3 md:py-3.5 pr-10 bg-[#1a1a1a] border border-[#666666] hover:border-[#0088CC] rounded-lg text-white placeholder-[#979797] focus:outline-none focus:ring-2 focus:ring-[#0088CC] focus:border-[#0088CC] text-xs sm:text-sm transition-all min-h-[44px] touch-target"
              />
              {selectedCountry && (
                <button
                  onClick={() => {
                    onCountryChange("");
                    setCountrySearch("");
                  }}
                  className="absolute top-1/2 right-3 transform -translate-y-1/2 text-[#979797] hover:text-white transition-colors p-1 hover:bg-[#666666]/20 rounded"
                  title="Clear selection"
                  aria-label="Clear country filter"
                >
                  <CloseIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
              )}
            </div>
            {countrySearch && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-[#1a1a1a] border border-[#666666] rounded-lg z-[999] max-h-48 overflow-y-auto shadow-xl">
                {filteredCountries.length > 0 ? (
                  filteredCountries.map((country) => (
                    <button
                      key={country}
                      onClick={() => {
                        onCountryChange(country);
                        setCountrySearch("");
                      }}
                      className="w-full text-left px-4 sm:px-5 py-2.5 sm:py-3 hover:bg-[#0088CC]/30 text-white text-xs sm:text-sm transition-all duration-200 border-b border-[#666666]/50 last:border-b-0 min-h-[44px] flex items-center hover:text-[#0088CC] font-medium"
                    >
                      {country}
                    </button>
                  ))
                ) : (
                  <div className="px-4 sm:px-5 py-3 sm:py-4 text-[#979797] text-xs sm:text-sm text-center">
                    No countries found
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Server Dropdown */}
          <div className="relative group">
            <label className="text-xs sm:text-sm font-bold text-white block mb-2 flex items-center gap-2">
              <ServerIcon className="w-4 h-4 text-[#979797]" />
              By Server
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder={
                  selectedServer ? selectedServer : "Select server..."
                }
                value={serverSearch}
                onChange={(e) => setServerSearch(e.target.value)}
                className="w-full px-4 sm:px-5 py-2.5 sm:py-3 md:py-3.5 pr-10 bg-[#1a1a1a] border border-[#666666] hover:border-[#0088CC] rounded-lg text-white placeholder-[#979797] focus:outline-none focus:ring-2 focus:ring-[#0088CC] focus:border-[#0088CC] text-xs sm:text-sm transition-all min-h-[44px] touch-target"
              />
              {selectedServer && (
                <button
                  onClick={() => {
                    onServerChange("");
                    setServerSearch("");
                  }}
                  className="absolute top-1/2 right-3 transform -translate-y-1/2 text-[#979797] hover:text-white transition-colors p-1 hover:bg-[#666666]/20 rounded"
                  title="Clear selection"
                  aria-label="Clear server filter"
                >
                  <CloseIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
              )}
            </div>
            {serverSearch && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-[#1a1a1a] border border-[#666666] rounded-lg z-[999] max-h-48 overflow-y-auto shadow-xl">
                {filteredServers.length > 0 ? (
                  filteredServers.map((server) => (
                    <button
                      key={server}
                      onClick={() => {
                        onServerChange(server);
                        setServerSearch("");
                      }}
                      className="w-full text-left px-4 sm:px-5 py-2.5 sm:py-3 hover:bg-[#0088CC]/30 text-white text-xs sm:text-sm transition-all duration-200 border-b border-[#666666]/50 last:border-b-0 min-h-[44px] flex items-center hover:text-[#0088CC] font-medium"
                    >
                      {server}
                    </button>
                  ))
                ) : (
                  <div className="px-4 sm:px-5 py-3 sm:py-4 text-[#979797] text-xs sm:text-sm text-center">
                    No servers found
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
