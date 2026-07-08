'use client';

import React from 'react';
import {
  Container,
  Form,
  Button,
} from 'react-bootstrap';

interface HeroSectionProps {
  searchQuery: string;
  setSearchQuery: (value: string) => void;
}

const HeroSection: React.FC<HeroSectionProps> = ({
  searchQuery,
  setSearchQuery,
}) => {

  return (

    <section className="hero-section">


      <div className="shape shape-one"></div>
      <div className="shape shape-two"></div>


      <Container className="hero-container">


        <div className="hero-content">


          {/* BRAND */}

          <div className="brand-wrapper">

            <div className="brand-icon">
              ✦
            </div>


            <h1>
              NONO
            </h1>

          </div>



          {/* BADGE */}

          <div className="badge-wrapper">

            <span>
              🔥 Wholesale & Retail Marketplace
            </span>

          </div>




          {/* TITLE */}

          <h2 className="hero-title">

            Buy Everything.
            <br />

            <span>
              Retail or Bulk
            </span>

          </h2>




          <p className="hero-description">

            Discover quality products, affordable prices,
            wholesale deals and fast delivery.

          </p>





          {/* ADVANCED SEARCH */}


          <div className="search-wrapper">


            <div className="advanced-search">



              {/* INPUT */}

              <div className="search-main">


                <div className="search-icon">


                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >

                    <circle
                      cx="11"
                      cy="11"
                      r="8"
                    />

                    <path
                      d="M21 21l-4.3-4.3"
                    />

                  </svg>


                </div>



                <Form.Control

                  type="text"

                  placeholder="Search products, brands, categories..."

                  value={searchQuery}

                  onChange={(e)=>setSearchQuery(e.target.value)}

                />



                {
                  searchQuery && (

                    <button

                      className="clear-search"

                      onClick={()=>setSearchQuery("")}

                    >

                      ×

                    </button>

                  )
                }


              </div>






              {/* CATEGORY */}

              <div className="category-select">


                <span>
                  📦
                </span>


                <select>

                  <option>
                    All Categories
                  </option>

                  <option>
                    Electronics
                  </option>


                  <option>
                    Accessories
                  </option>


                  <option>
                    Wholesale
                  </option>


                </select>


              </div>






              {/* BUTTON */}


              <Button className="search-button">


                Search

                <span>
                  →
                </span>


              </Button>



            </div>



          </div>







          {/* FEATURES */}


          <div className="features">


            <div>
              📱
              <span>
                Electronics
              </span>
            </div>


            <div>
              🔌
              <span>
                Accessories
              </span>
            </div>



            <div>
              📦
              <span>
                Bulk Deals
              </span>
            </div>



            <div>
              🚚
              <span>
                Fast Delivery
              </span>
            </div>


          </div>




        </div>


      </Container>







<style jsx>{`


.hero-section{


position:relative;

overflow:hidden;

background:

linear-gradient(
135deg,
#16a34a,
#22c55e,
#15803d
);


border-radius:

0 0 45px 45px;


color:white;


}





.hero-container{


padding:

70px 20px 55px;


position:relative;

z-index:2;


}





.hero-content{


max-width:850px;

margin:auto;

text-align:center;


}






/* BRAND */


.brand-wrapper{


display:flex;

justify-content:center;

align-items:center;

gap:12px;


}



.brand-icon{


font-size:42px;

font-weight:900;


}



.brand-wrapper h1{


font-size:52px;

font-weight:900;

letter-spacing:3px;

margin:0;


}







.badge-wrapper{


margin-top:15px;


}



.badge-wrapper span{


background:

rgba(255,255,255,.18);


padding:

8px 22px;


border-radius:50px;


font-size:13px;

font-weight:700;


backdrop-filter:blur(10px);


}







/* TITLE */


.hero-title{


margin-top:28px;


font-size:44px;


line-height:1.15;


font-weight:900;


}



.hero-title span{


color:#dcfce7;


}






.hero-description{


font-size:17px;


max-width:600px;


margin:

20px auto 35px;


opacity:.9;


}









/* SEARCH */


.search-wrapper{


max-width:780px;

margin:auto;


}





.advanced-search{


background:white;


padding:8px;


border-radius:70px;


display:flex;

align-items:center;


box-shadow:


0 20px 50px rgba(0,0,0,.25);


transition:.3s;


}



.advanced-search:hover{


transform:translateY(-3px);


}





.search-main{


flex:1;


display:flex;


align-items:center;


}



.search-icon{


padding-left:20px;


color:#64748b;


display:flex;


}





.search-main input{


height:58px;


border:none!important;


box-shadow:none!important;


font-size:16px;


padding-left:15px;


}



.search-main input::placeholder{


color:#94a3b8;


}





.clear-search{


border:none;


background:#e2e8f0;


width:30px;


height:30px;


border-radius:50%;


font-size:20px;


cursor:pointer;


color:#475569;


}





.category-select{


height:58px;


display:flex;


align-items:center;


gap:8px;


padding:0 18px;


border-left:1px solid #e2e8f0;


}



.category-select select{


border:none;


outline:none;


font-weight:600;


color:#334155;


background:white;


}





.search-button{


height:58px;


padding:

0 35px!important;


border:none!important;


border-radius:50px!important;


background:

linear-gradient(
135deg,
#15803d,
#22c55e
)!important;


font-weight:700!important;


display:flex;

align-items:center;


gap:10px;


}





/* FEATURES */


.features{


display:flex;


justify-content:center;


flex-wrap:wrap;


gap:12px;


margin-top:35px;


}



.features div{


display:flex;


align-items:center;


gap:8px;


padding:

10px 18px;


border-radius:30px;


background:

rgba(255,255,255,.15);


font-size:14px;


backdrop-filter:blur(10px);


}



.features span{


font-weight:600;


}






/* SHAPES */


.shape{


position:absolute;


border-radius:50%;


background:

rgba(255,255,255,.08);


}



.shape-one{


width:320px;

height:320px;

right:-100px;

top:-120px;


}



.shape-two{


width:250px;

height:250px;

left:-100px;

bottom:-100px;


}






/* MOBILE */


@media(max-width:768px){



.hero-container{


padding:

45px 15px 35px;


}



.brand-wrapper h1{


font-size:36px;


}



.brand-icon{


font-size:32px;


}



.hero-title{


font-size:30px;


}



.hero-description{


font-size:14px;


}



.advanced-search{


flex-direction:column;


border-radius:25px;


gap:10px;


}



.search-main{


width:100%;


}



.category-select{


width:100%;


border-left:none;


border-top:1px solid #e2e8f0;


}



.category-select select{


width:100%;


}



.search-button{


width:100%;


justify-content:center;


}



.features div{


font-size:12px;


padding:8px 14px;


}



}



`}</style>



    </section>

  );

};


export default HeroSection;