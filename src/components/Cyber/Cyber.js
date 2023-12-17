import React from 'react';
import { Card, Row, Col } from 'react-bootstrap';
import src from '../../images/header.jpg';
const Cyber = () => {
    const CyberServices = [
        {
          name: 'Printing',
          description: 'High-quality printing services for your documents, brochures, and promotional materials. We ensure sharp and vibrant prints to make your content stand out.',
          iconClass: 'fas fa-print'
        },
        {
          name: 'Photocopy',
          description: 'Quick and reliable photocopy services for all your copying needs. Whether it\'s black and white or color copies, we provide crisp reproductions of your documents.',
          iconClass: 'fas fa-copy'
        },
        {
          name: 'Scanning',
          description: 'Efficient scanning services to convert your physical documents into digital format. We offer high-resolution scanning for images, photos, and documents of all sizes.',
          iconClass: 'fas fa-file-alt'
        },
        {
          name: 'Lamination & Binding',
          description: 'Protect your documents with lamination and create professional-looking booklets with our binding services. We offer durable lamination and various binding options.',
          iconClass: 'fas fa-book'
        }
      ];
      const backgroundStyle = {
        backgroundImage: `url(${src})`,
        backgroundSize: 'cover',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center',
        //minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center', 
        color: 'green', 
      }; 
  return (
    <div className='text-center  bg-success d-flex flex-column 'style={backgroundStyle} >
        <h2 className="text-success text-3xl text-center display-5 font-weight-bolder mt-3 " href="/">
            Cyber Services
        </h2>
    <Row className=" p-2">
      {CyberServices.map((CyberServices, index) => (
        <Col key={index} md={6} lg={3}>
          <Card className="shadow-lg rounded text-center m-2">
            <div className="card-body">
            <i className={`fas ${CyberServices.iconClass} text-success fa-3x mb-3`} />
              <h5 className="card-title">
                <a href="/" className="text-success">
                  {CyberServices.name}
                </a>
              </h5>
              <p className="card-text">
                  {CyberServices.description}
              </p>
            </div>
          </Card>
        </Col>
      ))}
    </Row>
    </div>
  );
};

export default Cyber;
