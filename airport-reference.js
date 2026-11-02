import {readFileSync} from 'node:fs';
const dataset=JSON.parse(readFileSync(new URL('./data/airports.json',import.meta.url),'utf8'));
export const referenceSource=dataset.source;
export const airportReference=dataset.airports.map(row=>Object.fromEntries(dataset.fields.map((key,i)=>[key,row[i]])));
