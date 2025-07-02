import React, { useEffect, useState } from "react";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";

export const StadiumSelector = () => {
  const [stadiums, setStadiums] = useState([]);
  const navigate = useNavigate();
   const location = useLocation();
  const token = localStorage.getItem("token");

  const queryParams = new URLSearchParams(location.search);
  const redirectTo = queryParams.get("redirectTo") || "/organizer#addevent"

  console.log("redirectTo:", redirectTo);
  useEffect(() => {
    axios
      .get("/admin/stadiums", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setStadiums(res.data))
      .catch((err) => console.error(err));
  }, []);

   const selectStadium = (stadium) => {
    localStorage.setItem("selectedStadium", JSON.stringify(stadium));
    localStorage.setItem("selectedCategory", "Indoor");
    navigate(redirectTo);
  };

  // const selectStadium = (stadium) => {
  //   localStorage.setItem("selectedStadium", JSON.stringify(stadium));
  //   localStorage.setItem("selectedCategory", "Indoor");
  //   window.location.href = "/organizer#addevent";
  // };

  return (
    <div className="container mt-4">
      <h2 className="text-center mb-4">Select a Stadium</h2>
      <div className="row">
        {stadiums.map((s, stadiumIndex) => (
          <div className="col-md-6 mb-4" key={s._id}>
            <div className="card h-100 shadow border-0">
              {s.imageUrl && (
                <img
                  src={s.imageUrl}
                  className="card-img-top"
                  alt={s.name}
                  style={{ height: "200px", objectFit: "cover" }}
                />
              )}
              <div className="card-body">
                <h5 className="card-title">{s.name}</h5>
                <p className="card-text">Total Seats: {s.totalSeats}</p>
                <p>
                  <strong>Address:</strong>{" "}
                  <a
                    href={`https://www.google.com/maps?q=${s.location.latitude},${s.location.longitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {s.location?.address}
                  </a>
                </p>

                {/* Zones Accordion */}
                <div className="accordion" id={`zonesAccordion${stadiumIndex}`}>
                  {s.zones.map((zone, index) => (
                    <div className="accordion-item" key={index}>
                      <h2 className="accordion-header" id={`heading-${stadiumIndex}-${index}`}>
                        <button
                          className="accordion-button collapsed"
                          type="button"
                          data-bs-toggle="collapse"
                          data-bs-target={`#collapse-${stadiumIndex}-${index}`}
                          aria-expanded="false"
                          aria-controls={`collapse-${stadiumIndex}-${index}`}
                        >
                          Zone {String.fromCharCode(65 + index)} – ₹{zone.price}
                        </button>
                      </h2>
                      <div
                        id={`collapse-${stadiumIndex}-${index}`}
                        className="accordion-collapse collapse"
                        aria-labelledby={`heading-${stadiumIndex}-${index}`}
                        data-bs-parent={`#zonesAccordion${stadiumIndex}`}
                      >
                        <div className="accordion-body">
                          <div className="d-flex flex-wrap gap-2">
                            {zone.seatLabels.map((label, i) => (
                              <span key={i} className="badge bg-secondary">
                                {label}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  className="btn btn-success mt-3 w-100"
                  onClick={() => selectStadium(s)}
                >
                  Select Stadium
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};


// import React, { useEffect, useState } from "react";
// import axios from "axios";
// import { useNavigate } from "react-router-dom";

// export const StadiumSelector = () => {
//   const [stadiums, setStadiums] = useState([]);
//   const navigate = useNavigate();
//   const token = localStorage.getItem("token");

//   useEffect(() => {
//     axios
//       .get("/admin/stadiums", {
//         headers: { Authorization: `Bearer ${token}` },
//       })
//       .then((res) => setStadiums(res.data))
//       .catch((err) => console.error(err));
//   }, []);

//   const selectStadium = (stadium) => {
//     localStorage.setItem("selectedStadium", JSON.stringify(stadium));
//      localStorage.setItem("selectedCategory", "Indoor");
//      window.location.href = "/organizer#addevent";
//   };

//   return (
//     <div className="container mt-4">
//       <h2 className="text-center mb-4">Select a Stadium</h2>
//       <div className="row">
//         {stadiums.map((s) => (
//           <div className="col-md-4 mb-4" key={s._id}>
//             <div className="card h-100 shadow">
//               {s.imageUrl && (
//                 <img
//                   src={s.imageUrl}
//                   className="card-img-top"
//                   alt={s.name}
//                   style={{ height: "200px", objectFit: "cover" }}
//                 />
//               )}
//               <div className="card-body">
//                 <h5 className="card-title">{s.name}</h5>
//                 <p className="card-text">Total Seats: {s.totalSeats}</p>
//                 <p>
//                   <strong>Address:</strong>{" "}
//                   <a
//                     href={`https://www.google.com/maps?q=${s.location.latitude},${s.location.longitude}`}
//                     target="_blank"
//                     rel="noopener noreferrer"
//                   >
//                     {s.location?.address}
//                   </a>
//                 </p>
//                 <button
//                   className="btn btn-success mt-2"
//                   onClick={() => selectStadium(s)}
//                 >
//                   Select Stadium
//                 </button>
//               </div>
//             </div>
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// };

