import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

const ViewStadiums = () => {
  const [stadiums, setStadiums] = useState([]);
  const [expandedZone, setExpandedZone] = useState({});
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchStadiums = async () => {
      try {
        const res = await axios.get("/admin/stadiums", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setStadiums(res.data);
      } catch (err) {
        console.error("Error fetching stadiums:", err);
      }
    };
    fetchStadiums();
  }, [token]);

  const toggleZone = (stadiumId, zoneIndex) => {
    const key = `${stadiumId}_${zoneIndex}`;
    setExpandedZone((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleExpandAll = (expand) => {
    const newState = {};
    stadiums.forEach((stadium) => {
      stadium.zones.forEach((_, i) => {
        const key = `${stadium._id}_${i}`;
        newState[key] = expand;
      });
    });
    setExpandedZone(newState);
  };

  return (
    <div className="container mt-4">
      <h2 className="text-center mb-4">All Stadiums</h2>

      <div className="text-end mb-3">
        <button
          className="btn btn-outline-secondary me-2"
          onClick={() => handleExpandAll(true)}
        >
          Expand All
        </button>
        <button
          className="btn btn-outline-secondary"
          onClick={() => handleExpandAll(false)}
        >
          Collapse All
        </button>
      </div>

      <div className="row">
        {stadiums.map((stadium) => (
          <div className="col-md-6 mb-4" key={stadium._id}>
            <div className="card shadow-sm h-100">
              {stadium.imageUrl && (
                <img
                  src={stadium.imageUrl}
                  alt={stadium.name}
                  className="card-img-top"
                  style={{ height: "250px", objectFit: "cover" }}
                />
              )}
              <div className="card-body">
                <h5 className="card-title">{stadium.name}</h5>
                <p>
                  <strong>Address:</strong>{" "}
                  <a
                    href={`https://www.google.com/maps?q=${stadium.location.latitude},${stadium.location.longitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {stadium.location?.address}
                  </a>
                </p>
                <p>
                  <strong>Total Seats:</strong> {stadium.totalSeats}
                </p>

                <strong>Zones:</strong>
                <div className="mt-2">
                  {stadium.zones.map((zone, i) => {
                    const key = `${stadium._id}_${i}`;
                    const isOpen = expandedZone[key];
                    const zoneName = String.fromCharCode(65 + i);
                    return (
                      <div key={key} className="mb-2">
                        <button
                          className="btn btn-outline-primary btn-sm w-100 text-start"
                          onClick={() => toggleZone(stadium._id, i)}
                        >
                          {isOpen ? "▼" : "▶"} Zone {zoneName}{" "}
                          {zone.price && ` - ₹${zone.price}`}
                        </button>

                        {isOpen && (
                          <div className="mt-2 p-2 border rounded bg-light">
                            <p className="text-muted mb-2">
                              Total Seats: {zone.seatLabels.length}
                            </p>
                            <div
                              style={{
                                display: "grid",
                                gridTemplateColumns: "repeat(10, 1fr)",
                                gap: "6px",
                              }}
                            >
                              {zone.seatLabels.map((seat, idx) => (
                                <div
                                  key={idx}
                                  style={{
                                    backgroundColor: "#e6f0ff",
                                    padding: "6px",
                                    textAlign: "center",
                                    borderRadius: "4px",
                                    fontSize: "14px",
                                    fontWeight: "500",
                                    border: "1px solid #cce",
                                  }}
                                >
                                  {seat}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
                     <Link to={`/admin/editstadium/${stadium._id}`} className="btn btn-warning">
                         Edit
                      </Link>
              </div>
            </div>
          </div>
        ))}

      </div>
    </div>
  );
};

export default ViewStadiums;


//  import React, { useEffect, useState } from "react";
// import axios from "axios";

// const ViewStadiums = () => {
//   const [stadiums, setStadiums] = useState([]);
//   const [expandedZone, setExpandedZone] = useState({}); // Keeps track of open zones
//   const token = localStorage.getItem("token");

//   useEffect(() => {
//     const fetchStadiums = async () => {
//       try {
//         const res = await axios.get("/admin/stadiums", {
//           headers: {
//             Authorization: `Bearer ${token}`,
//           },
//         });
//         setStadiums(res.data);
//       } catch (err) {
//         console.error("Error fetching stadiums:", err);
//       }
//     };
//     fetchStadiums();
//   }, [token]);

//   const toggleZone = (stadiumId, zoneIndex) => {
//     const key = `${stadiumId}_${zoneIndex}`;
//     setExpandedZone((prev) => ({
//       ...prev,
//       [key]: !prev[key], // toggle open/close
//     }));
//   };

//   return (
//     <div className="container mt-4">
//       <h2 className="text-center mb-4">All Stadiums</h2>
//       <div className="row">
//         {stadiums.map((stadium) => (
//           <div className="col-md-6 mb-4" key={stadium._id}>
//             <div className="card shadow-sm h-100">
//               {stadium.imageUrl && (
//                 <img
//                   src={stadium.imageUrl}
//                   alt={stadium.name}
//                   className="card-img-top"
//                   style={{ height: "250px", objectFit: "cover" }}
//                 />
//               )}
//               <div className="card-body">
//                 <h5 className="card-title">{stadium.name}</h5>
//                 <p>
//                   <strong>Address:</strong>{" "}
//                   <a
//                     href={`https://www.google.com/maps?q=${stadium.location.latitude},${stadium.location.longitude}`}
//                     target="_blank"
//                     rel="noopener noreferrer"
//                   >
//                     {stadium.location?.address}
//                   </a>
//                 </p>
//                 <p><strong>Total Seats:</strong> {stadium.totalSeats}</p>

//                 <strong>Zones:</strong>
//                 <div className="mt-2">
//                   {stadium.zones.map((zone, i) => {
//                     const key = `${stadium._id}_${i}`;
//                     const isOpen = expandedZone[key];
//                     return (
//                       <div key={key} className="mb-2">
//                         <button
//                           className="btn btn-outline-primary btn-sm w-100 text-start"
//                           onClick={() => toggleZone(stadium._id, i)}
//                         >
//                           {isOpen ? "▼" : "▶"} Zone {String.fromCharCode(65 + i)}
//                         </button>

//                         {isOpen && (
//                           <div className="mt-2 p-2 border rounded bg-light">
//                             <div
//                               style={{
//                                 display: 'grid',
//                                 gridTemplateColumns: 'repeat(10, 1fr)',
//                                 gap: '6px',
//                               }}
//                             >
//                               {zone.seatLabels.map((seat, idx) => (
//                                 <div
//                                   key={idx}
//                                   style={{
//                                     backgroundColor: "#e0e0e0",
//                                     padding: "6px",
//                                     textAlign: "center",
//                                     borderRadius: "4px",
//                                   }}
//                                 >
//                                   {seat}
//                                 </div>
//                               ))}
//                             </div>
//                           </div>
//                         )}
//                       </div>
//                     );
//                   })}
//                 </div>
//               </div>
//             </div>
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// };

// export default ViewStadiums;

