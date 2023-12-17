import React from 'react';
import { Card, Row, Col } from 'react-bootstrap';

const SoftwareComponent = () => {
  const developmentServices = [
    {
      name: 'Web Development',
      description: 'Create dynamic and responsive websites tailored to your business needs. Our web development services cover front-end and back-end development using the latest technologies.',
      iconClass: 'fas fa-globe'
    },
    {
      name: 'Mobile Development',
      description: 'Build powerful and user-friendly mobile applications for iOS and Android platforms. Our mobile development services include native and cross-platform app development.',
      iconClass: 'fas fa-mobile-alt'
    },
    {
      name: 'Software Development',
      description: 'Design and develop customized software solutions to streamline your business processes. Our software development services cover desktop applications, enterprise solutions, and more.',
      iconClass: 'fas fa-cogs'
    }
  ];
  
  return (
    <div className='text-center text-3xl'>
        <h4 className="text-success text-center display-5 font-weight-bolder " href="/">
            Software Development
        </h4>
    <Row className="mt-4 p-2">
      {developmentServices.map((developmentServices, index) => (
        <Col key={index} md={6} lg={4}>
          <Card className="shadow-lg text-center m-2 rounded-lg">
            <div className="card-body">
            <i className={`fas ${developmentServices.iconClass} text-success fa-3x mb-3`} />
              
              {/* <img
                src="https://via.placeholder.com/150"
                alt={service}
                className="img-fluid rounded-circle mb-3"
              /> */}
              <h5 className="card-title">
                <a href="/" className="text-success">
                  {developmentServices.name}
                </a>
              </h5>
              <p className="card-text">
                  {developmentServices.description}
              </p>
            </div>
          </Card>
        </Col>
      ))}
    </Row>
    </div>
  );
};

export default SoftwareComponent;
