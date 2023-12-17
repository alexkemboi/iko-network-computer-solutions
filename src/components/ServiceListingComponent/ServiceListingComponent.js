import React from 'react';
import { Card, Row, Col } from 'react-bootstrap';

const ServiceListComponent = () => {
  const services = [
    {
      name: 'Graphic Design',
      description: 'Create visually appealing designs for various purposes, including digital and print media. Our graphic design services encompass logo design, branding, and illustration.',
      iconClass: 'fas fa-paint-brush'
    },
    {
      name: 'Online Services',
      description: 'Offering a range of online services, including web development, e-commerce solutions, and digital marketing. Enhance your online presence and reach a wider audience.',
      iconClass: 'fas fa-globe'
    },
    {
      name: 'CCTV Installation',
      description: 'Ensure the security of your premises with our CCTV installation services. We provide professional setup and configuration to monitor and protect your property.',
      iconClass: 'fas fa-video'
    },
    {
      name: 'Network Installation',
      description: 'Set up robust and efficient network infrastructure for your business. Our network installation services include configuring routers, switches, and ensuring reliable connectivity.',
      iconClass: 'fas fa-network-wired'
    },
    {
      name: 'Branding',
      description: 'Build a strong brand identity that resonates with your target audience. Our branding services cover logo design, brand strategy, and consistent visual elements for a cohesive brand image.',
      iconClass: 'fas fa-id-badge'
    },
    {
      name: 'Computer Maintenance',
      description: 'Keep your computer systems running smoothly with our maintenance services. We offer regular check-ups, updates, and troubleshooting to prevent and resolve issues.',
      iconClass: 'fas fa-laptop-medical'
    }
  ];
  return (
    <div className='text-center text-3xl'>
        <h4 className="text-success text-center display-5 font-weight-bolder " href="/">
            Our Services
        </h4>
    <Row className="mt-4 p-2">
      {services.map((service, index) => (
        <Col key={index} md={6} lg={3}>
          <Card className="shadow-lg rounded text-center m-2">
            <div className="card-body">
            <i className={`fas ${service.iconClass} text-success fa-3x mb-3`} />
              
              {/* <img
                src="https://via.placeholder.com/150"
                alt={service}
                className="img-fluid rounded-circle mb-3"
              /> */}
              <h5 className="card-title">
                <a href="/" className="text-success">
                  {service.name}
                </a>
              </h5>
              <p className="card-text">
                  {service.description}
              </p>
            </div>
          </Card>
        </Col>
      ))}
    </Row>
    </div>
  );
};

export default ServiceListComponent;
