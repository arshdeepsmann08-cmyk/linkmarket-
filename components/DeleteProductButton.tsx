"use client";
export function DeleteProductButton(){return <button type="submit" className="text-red-600" onClick={e=>{if(!confirm("Delete this product? This cannot be undone."))e.preventDefault()}}>Delete</button>}
