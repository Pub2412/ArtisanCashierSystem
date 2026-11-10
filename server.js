require('dotenv').config();
const path = require('path');
const express = require('express');
const mongoose = require('mongoose');
const app = express();
const PORT = process.env.PORT || 3000;
const Sale = mongoose.model('Sale', new mongoose.Schema({
  category: {type:String, enum:['Henna','Pins'], required:true}, customer:{type:String, required:true},
  artist:String, size:String, price:{type:Number, min:0, required:true}, recordedBy:{type:String, required:true},
  createdAt:{type:Date, default:Date.now}, voided:{type:Boolean, default:false}, voidedAt:Date, voidedBy:String
}));
app.use(express.json()); app.use(express.static(__dirname));
app.get('/api/health',(req,res)=>res.json({ok:true}));
app.get('/api/sales',async(req,res,next)=>{try{res.json(await Sale.find().sort({createdAt:-1}))}catch(e){next(e)}});
app.post('/api/sales',async(req,res,next)=>{try{res.status(201).json(await Sale.create(req.body))}catch(e){next(e)}});
app.post('/api/sales/:id/void',async(req,res,next)=>{try{if(req.body.code!=='TPAT2026')return res.status(403).json({error:'Invalid void code'});res.json(await Sale.findByIdAndUpdate(req.params.id,{voided:true,voidedAt:new Date(),voidedBy:req.body.recordedBy},{new:true}))}catch(e){next(e)}});
app.delete('/api/sales',async(req,res,next)=>{try{if(req.body.code!=='TPAT2026')return res.status(403).json({error:'Invalid clearance code'});await Sale.deleteMany({});res.status(204).end()}catch(e){next(e)}});
app.use((err,req,res,next)=>{console.error(err);res.status(500).json({error:'Server error'})});
async function start(){if(process.env.MONGODB_URI){await mongoose.connect(process.env.MONGODB_URI);console.log('MongoDB connected')}else console.warn('MONGODB_URI is not set; API cannot persist sales.');app.listen(PORT,()=>console.log(`Cashier app running on port ${PORT}`))}
start().catch(err=>{console.error('Startup failed:',err);process.exit(1)});
