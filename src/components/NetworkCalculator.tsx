import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Wifi, Binary, Globe } from 'lucide-react';

interface SubnetResult {
  ip: string;
  mask: string;
  network: string;
  broadcast: string;
  firstHost: string;
  lastHost: string;
  totalHosts: number;
  usableHosts: number;
  cidr: number;
  binaryIp: string;
  binaryMask: string;
  binaryNetwork: string;
}

export const NetworkCalculator: React.FC = () => {
  const [input, setInput] = useState('192.168.1.10/24');
  const [result, setResult] = useState<SubnetResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Hjelpefunksjon: Konverter IP til 32-bit tall
  const ipToInt = (ip: string): number => {
    return ip.split('.').reduce((acc, octet) => (acc << 8) + parseInt(octet, 10), 0) >>> 0;
  };

  // Hjelpefunksjon: Konverter 32-bit tall til IP string
  const intToIp = (int: number): string => {
    return [
      (int >>> 24) & 255,
      (int >>> 16) & 255,
      (int >>> 8) & 255,
      int & 255
    ].join('.');
  };

  // Hjelpefunksjon: Konverter 32-bit tall til Binær string (med punktum)
  const intToBinaryStr = (int: number): string => {
    let bin = (int >>> 0).toString(2).padStart(32, '0');
    return bin.match(/.{1,8}/g)?.join('.') || bin;
  };

  const calculateSubnet = () => {
    try {
      setError(null);
      // Parse input (støtter både med og uten CIDR)
      const parts = input.split('/');
      const ipStr = parts[0];
      let cidr = parts.length > 1 ? parseInt(parts[1], 10) : 24; // Default til /24

      // Validering
      if (!/^(\d{1,3}\.){3}\d{1,3}$/.test(ipStr)) throw new Error("Ugyldig IP-format");
      if (cidr < 0 || cidr > 32) throw new Error("CIDR må være mellom 0 og 32");

      const ipVal = ipToInt(ipStr);
      const maskVal = cidr === 0 ? 0 : (~0 << (32 - cidr)) >>> 0;
      const networkVal = (ipVal & maskVal) >>> 0;
      const broadcastVal = (networkVal | (~maskVal >>> 0)) >>> 0;

      const usableHosts = Math.max(0, Math.pow(2, 32 - cidr) - 2);
      const totalHosts = Math.pow(2, 32 - cidr);

      setResult({
        ip: ipStr,
        mask: intToIp(maskVal),
        network: intToIp(networkVal),
        broadcast: intToIp(broadcastVal),
        firstHost: intToIp(networkVal + 1),
        lastHost: intToIp(broadcastVal - 1),
        totalHosts,
        usableHosts,
        cidr,
        binaryIp: intToBinaryStr(ipVal),
        binaryMask: intToBinaryStr(maskVal),
        binaryNetwork: intToBinaryStr(networkVal)
      });

    } catch (err) {
      setResult(null);
      setError("Ugyldig IP-adresse eller CIDR (f.eks. 192.168.1.1/24)");
    }
  };

  useEffect(() => {
    const timer = setTimeout(calculateSubnet, 300);
    return () => clearTimeout(timer);
  }, [input]);

  return (
    <div className="grid lg:grid-cols-2 gap-8">
      {/* Input Section */}
      <div className="space-y-6">
        <div className="bg-surface/50 backdrop-blur-md border border-white/10 p-6 rounded-2xl">
          <h3 className="text-xl font-bold text-secondary mb-6 flex items-center gap-2">
            <Wifi className="w-5 h-5" />
            Nettverkskonfigurasjon
          </h3>

          <div>
            <label className="block text-sm text-gray-400 mb-2">IP Adresse (CIDR notasjon)</label>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="w-full bg-background/50 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-secondary/50 transition-colors font-mono text-lg"
              placeholder="192.168.1.10/24"
            />
            <p className="text-xs text-gray-500 mt-2">Støtter format som: 10.0.0.1/8, 192.168.1.50 (default /24)</p>
          </div>

          {error && (
            <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-200 text-sm">
              {error}
            </div>
          )}
        </div>

        {/* Quick Stats */}
        {result && !error && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-2 gap-4"
          >
             <div className="p-4 bg-surface/30 border border-white/5 rounded-xl backdrop-blur-sm">
                <div className="text-gray-400 text-xs uppercase mb-1">Antall Host-adresser</div>
                <div className="text-2xl font-bold text-white">{result.usableHosts.toLocaleString()}</div>
             </div>
             <div className="p-4 bg-surface/30 border border-white/5 rounded-xl backdrop-blur-sm">
                <div className="text-gray-400 text-xs uppercase mb-1">Klasse (Est.)</div>
                <div className="text-2xl font-bold text-secondary">
                   {parseInt(result.ip.split('.')[0]) < 128 ? 'A' : parseInt(result.ip.split('.')[0]) < 192 ? 'B' : 'C'}
                </div>
             </div>
          </motion.div>
        )}
      </div>

      {/* Visual Explanation & Results */}
      <div className="space-y-6">
        {result && !error && (
          <>
            {/* Main Result Card */}
            <motion.div 
               initial={{ opacity: 0, x: 20 }}
               animate={{ opacity: 1, x: 0 }}
               className="bg-surface/50 backdrop-blur-md border border-white/10 p-6 rounded-2xl space-y-4"
            >
              <div className="flex items-center gap-2 mb-4 text-secondary">
                <Globe className="w-5 h-5" />
                <span className="font-semibold">Adresse Oversikt</span>
              </div>

              <div className="grid gap-4 font-mono text-sm md:text-base">
                 <div className="flex justify-between items-center p-3 bg-black/20 rounded-lg border-l-2 border-secondary">
                    <span className="text-gray-400">Nettverksadresse</span>
                    <span className="font-bold text-white">{result.network}</span>
                 </div>
                 <div className="flex justify-between items-center p-3 bg-black/20 rounded-lg border-l-2 border-primary">
                    <span className="text-gray-400">Broadcast</span>
                    <span className="font-bold text-white">{result.broadcast}</span>
                 </div>
                 <div className="flex justify-between items-center p-3 bg-black/20 rounded-lg">
                    <span className="text-gray-400">Maske</span>
                    <span className="text-gray-300">{result.mask}</span>
                 </div>
                 <div className="flex justify-between items-center p-3 bg-black/20 rounded-lg">
                    <span className="text-gray-400">Område (Range)</span>
                    <span className="text-gray-300 text-right">{result.firstHost} <br/> {result.lastHost}</span>
                 </div>
              </div>
            </motion.div>

            {/* Binary Calculation Visualization */}
            <motion.div 
               initial={{ opacity: 0, x: 20 }}
               animate={{ opacity: 1, x: 0 }}
               transition={{ delay: 0.1 }}
               className="bg-gradient-to-br from-surface/50 to-background border border-white/10 p-6 rounded-2xl overflow-hidden"
            >
               <div className="flex items-center gap-2 mb-6 text-primary">
                  <Binary className="w-5 h-5" />
                  <span className="font-semibold">Hvordan regner vi det ut?</span>
               </div>

               <div className="space-y-6 font-mono text-xs md:text-sm overflow-x-auto">
                  <div>
                    <div className="flex justify-between text-gray-500 mb-1">
                       <span>IP Adresse (Binær)</span>
                    </div>
                    <div className="tracking-widest text-white">
                       {result.binaryIp.split('').map((char, i) => (
                          <span key={i} className={char === '.' ? 'text-gray-600 mx-1' : (i < result.cidr + Math.floor(result.cidr/8)) ? 'text-secondary' : 'text-gray-400'}>
                             {char}
                          </span>
                       ))}
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-gray-500 mb-1">
                       <span>Subnettmaske / {result.cidr}</span>
                    </div>
                    <div className="tracking-widest text-white">
                       {result.binaryMask.split('').map((char, i) => (
                          <span key={i} className={char === '.' ? 'text-gray-600 mx-1' : 'text-primary'}>
                             {char}
                          </span>
                       ))}
                    </div>
                  </div>
                  
                  <div className="h-px bg-white/20 w-full" />

                  <div>
                    <div className="flex justify-between text-gray-500 mb-1">
                       <span>AND Operasjon = Nettverk</span>
                    </div>
                    <div className="tracking-widest text-white">
                       {result.binaryNetwork.split('').map((char, i) => (
                          <span key={i} className={char === '.' ? 'text-gray-600 mx-1' : (i < result.cidr + Math.floor(result.cidr/8)) ? 'text-secondary font-bold' : 'text-gray-600'}>
                             {char}
                          </span>
                       ))}
                    </div>
                    <p className="mt-2 text-gray-400 font-sans text-xs leading-relaxed">
                       Vi bruker en logisk <span className="text-primary">AND</span>-operasjon. 
                       Nettverksadressen beholder bitene der masken er 1 (cyan), og setter resten til 0 (grå).
                    </p>
                  </div>
               </div>
            </motion.div>
          </>
        )}
      </div>
    </div>
  );
};

