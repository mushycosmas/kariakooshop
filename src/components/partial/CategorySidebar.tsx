"use client";

import { useEffect, useState } from "react";
import { Spinner } from "react-bootstrap";

interface Subcategory {
  id: string;
  name: string;
}

interface Category {
  id: string;
  name: string;
  icon: string;
  subcategories: Subcategory[];
}


interface Props {
  onSubcategorySelect: (subcategoryId:string)=>void;
}



const CategorySidebar:React.FC<Props> = ({
  onSubcategorySelect
})=>{


const [categories,setCategories]=useState<Category[]>([]);

const [loading,setLoading]=useState(true);

const [hovered,setHovered]=useState<string|null>(null);



useEffect(()=>{


const loadCategories=async()=>{


try{


const response = await fetch("/api/categories_sub");

const data = await response.json();

setCategories(data);



}catch(error){

console.error(
"Category loading error",
error
);


}finally{

setLoading(false);

}


};


loadCategories();


},[]);





return (

<div className="category-wrapper">


<div className="category-card">



<div className="category-header">

<div className="category-title">

🛒

<span>
Categories
</span>

</div>


</div>






<div className="category-body">



{
loading ? (

<div className="loading">

<Spinner animation="border"/>

</div>


):(


<>


<div

className="category-item all"

onClick={()=>onSubcategorySelect("all")}

>

<span>
🌍 All Products
</span>


</div>





{
categories.map((cat)=>(


<div

key={cat.id}

className="category-item-wrapper"

onMouseEnter={()=>setHovered(cat.id)}

onMouseLeave={()=>setHovered(null)}

>


<div

className="category-item"

>


<div>

<span className="icon">

{cat.icon}

</span>


{cat.name}

</div>


{
cat.subcategories.length>0 &&

<span className="arrow">
›
</span>

}


</div>





{
hovered===cat.id &&

cat.subcategories.length>0 &&


<div className="submenu">


<h6>
{cat.name}
</h6>



{
cat.subcategories.map(sub=>(


<div

key={sub.id}

className="submenu-item"

onClick={()=>onSubcategorySelect(sub.id)}

>

{sub.name}

</div>


))
}



</div>


}



</div>


))


}



</>


)

}




</div>


</div>




<style jsx>{`

.category-wrapper{

position:sticky;

top:90px;

z-index:20;

}



.category-card{


background:white;


border-radius:18px;


overflow:visible;


box-shadow:

0 10px 35px rgba(0,0,0,.08);


border:1px solid #e5e7eb;


}





.category-header{


padding:18px;


background:

linear-gradient(
135deg,
#16a34a,
#22c55e
);


border-radius:

18px 18px 0 0;


color:white;


}



.category-title{


display:flex;

align-items:center;

gap:10px;


font-size:18px;


font-weight:800;


}




.category-body{


padding:12px;


}




.loading{


display:flex;

justify-content:center;

padding:30px;


}






.category-item-wrapper{


position:relative;


}




.category-item{


height:48px;


display:flex;


align-items:center;


justify-content:space-between;


padding:

0 15px;


border-radius:12px;


font-size:14px;


font-weight:600;


cursor:pointer;


transition:.25s;


color:#334155;


}



.category-item:hover{


background:#f0fdf4;


color:#15803d;


transform:

translateX(4px);


}




.category-item .icon{


font-size:20px;

margin-right:10px;


}




.arrow{


font-size:24px;

color:#94a3b8;


}





.all{


background:#f8fafc;

margin-bottom:8px;


}







/* SUB MENU */


.submenu{


position:absolute;


left:100%;


top:0;


width:250px;


background:white;


border-radius:15px;


padding:15px;


margin-left:8px;


box-shadow:

0 15px 40px rgba(0,0,0,.15);


border:1px solid #e5e7eb;


animation:

slide .2s ease;


}



.submenu h6{


font-size:15px;

font-weight:800;

color:#16a34a;

border-bottom:1px solid #eee;

padding-bottom:10px;


}



.submenu-item{


padding:10px 12px;


border-radius:10px;


font-size:14px;


cursor:pointer;


transition:.2s;


}



.submenu-item:hover{


background:#dcfce7;


color:#15803d;


}





@keyframes slide{


from{

opacity:0;

transform:translateX(-10px);

}


to{

opacity:1;

transform:translateX(0);

}


}







@media(max-width:768px){


.category-wrapper{

position:relative;

top:0;

}



.submenu{

display:none;

}



}


`}</style>



</div>


);


};


export default CategorySidebar;