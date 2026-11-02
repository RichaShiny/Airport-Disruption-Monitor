import {airportReference,referenceSource} from './airport-reference.js';
import {start,upstream} from './server-core.js';
import {parseFAA,weatherFlag} from './disruptions.js';
const codes=["JFK", "EWR", "LGA", "ATL", "ORD", "DFW", "DEN", "LAX", "SFO", "SEA", "LAS", "MIA", "FLL", "MCO", "BOS", "PHX", "IAH", "CLT", "MSP", "DTW", "PHL", "SLC", "DCA", "IAD", "BWI", "SAN", "TPA", "BNA", "AUS", "PDX", "STL", "HNL", "OAK", "SJC", "RDU", "MSY", "MCI", "SNA", "SMF", "CLE", "PIT", "SAT", "IND", "CVG", "CMH", "MKE", "RSW", "JAX", "MEM", "ABQ"];
const airports=codes.map(code=>airportReference.find(a=>a.iata===code)).filter(Boolean).map(a=>[a.iata,a.icao,a.name]);
start(async url=>{
 if(url.pathname!=='/api/status')throw new Error('Unknown endpoint');
 const [faa,wx,taf]=await Promise.allSettled([upstream('https://nasstatus.faa.gov/api/airport-status-information','xml').then(parseFAA),upstream('https://aviationweather.gov/api/data/metar?ids='+airports.map(a=>a[1]).join(',')+'&format=json').then(x=>{if(!Array.isArray(x))throw new Error('Unexpected weather format');return x;}),upstream('https://aviationweather.gov/api/data/taf?ids='+airports.map(a=>a[1]).join(',')+'&format=json').then(x=>{if(!Array.isArray(x))throw new Error('Unexpected forecast format');return x;})]);
 if(faa.status==='rejected'&&wx.status==='rejected')throw new Error('FAA and weather feeds unavailable. '+faa.reason.message);
 const reports=wx.status==='fulfilled'?wx.value:[];
 const forecasts=taf.status==='fulfilled'?taf.value:[];
 return {referenceSource,forecast:{available:taf.status==='fulfilled',error:taf.reason?.message||null},fetchedAt:new Date().toISOString(),faa:{available:faa.status==='fulfilled',updatedAt:faa.value?.updatedAt||null,error:faa.reason?.message||null},weather:{available:wx.status==='fulfilled',error:wx.reason?.message||null},events:faa.value?.events||[],airports:airports.map(([iata,icao,name])=>{const metar=reports.filter(m=>m.icaoId===icao).sort((a,b)=>b.obsTime-a.obsTime)[0]||null;return {...airportReference.find(a=>a.iata===iata),iata,icao,name,metar,taf:forecasts.filter(t=>t.icaoId===icao).sort((a,b)=>Date.parse(b.issueTime)-Date.parse(a.issueTime))[0]||null,weatherFlag:weatherFlag(metar)};})};
});
