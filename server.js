import {start,upstream} from './server-core.js';
import {parseFAA,weatherFlag} from './disruptions.js';
const airports=[['JFK','KJFK','New York JFK'],['EWR','KEWR','Newark'],['LGA','KLGA','New York LaGuardia'],['ATL','KATL','Atlanta'],['ORD','KORD','Chicago O’Hare'],['DFW','KDFW','Dallas Fort Worth'],['DEN','KDEN','Denver'],['LAX','KLAX','Los Angeles'],['SFO','KSFO','San Francisco'],['SEA','KSEA','Seattle'],['LAS','KLAS','Las Vegas'],['MIA','KMIA','Miami'],['FLL','KFLL','Fort Lauderdale'],['MCO','KMCO','Orlando'],['BOS','KBOS','Boston']];
start(async url=>{
 if(url.pathname!=='/api/status')throw new Error('Unknown endpoint');
 const [faa,wx]=await Promise.allSettled([upstream('https://nasstatus.faa.gov/api/airport-status-information','xml').then(parseFAA),upstream('https://aviationweather.gov/api/data/metar?ids='+airports.map(a=>a[1]).join(',')+'&format=json').then(x=>{if(!Array.isArray(x))throw new Error('Unexpected weather format');return x;})]);
 if(faa.status==='rejected'&&wx.status==='rejected')throw new Error('FAA and weather feeds unavailable. '+faa.reason.message);
 const reports=wx.status==='fulfilled'?wx.value:[];
 return {fetchedAt:new Date().toISOString(),faa:{available:faa.status==='fulfilled',updatedAt:faa.value?.updatedAt||null,error:faa.reason?.message||null},weather:{available:wx.status==='fulfilled',error:wx.reason?.message||null},events:faa.value?.events||[],airports:airports.map(([iata,icao,name])=>{const metar=reports.filter(m=>m.icaoId===icao).sort((a,b)=>b.obsTime-a.obsTime)[0]||null;return {iata,icao,name,metar,weatherFlag:weatherFlag(metar)};})};
});
