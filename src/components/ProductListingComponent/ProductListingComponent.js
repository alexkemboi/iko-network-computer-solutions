import React from 'react';
import { Card, Row, Col } from 'react-bootstrap';

const ProductListComponent = () => {
  
  
  const products = [
    {
      name: 'Laptops',
      description: 'Explore our range of powerful and portable laptops. Perfect for work, entertainment, and on-the-go productivity. Choose from a variety of configurations to meet your specific needs.',
      iconClass: 'fas fa-laptop'
    },
    {
      name: 'Desktops',
      description: 'Discover reliable desktop computers for your home or office. Our desktops are designed for performance and efficiency, offering a seamless computing experience for various tasks.',
      iconClass: 'fas fa-desktop'
    },
    {
      name: 'Monitors',
      description: 'Enhance your viewing experience with our high-quality monitors. Choose from a variety of sizes and resolutions to suit your gaming, design, or productivity needs.',
      iconClass: 'fas fa-desktop'
    },
    {
      name: 'Keyboards',
      description: 'Find the perfect keyboard for comfortable and efficient typing. Our keyboards come in various styles, including mechanical and ergonomic options, to cater to your preferences.',
      iconClass: 'fas fa-keyboard'
    },
    {
      name: 'Cables',
      description: 'Browse our selection of reliable cables for connecting and powering your devices. We offer a range of cables, including HDMI, USB, and power cables, ensuring seamless connectivity.',
      iconClass: 'fas fa-plug'
    },
    {
      name: 'Mouse',
      description: 'Experience precision and comfort with our selection of mice. Whether you need a gaming mouse for intense gaming sessions or a wireless mouse for convenience, we have options to suit your needs.',
      iconClass: 'fas fa-mouse-pointer'
    }
    
  ];
  
  
  return (
    <div className='text-center text-3xl'>
        <h4 className="text-success text-center display-5 font-weight-bolder " href="/">
           Computers and Accessories
        </h4>
    <Row className="mt-4 p-2">
      {products.map((product, index) => (
        <Col key={index} md={6} lg={3}>
          <Card className="shadow-lg rounded text-center m-2">
            <div className="card-body">
            <i className={`fas ${product.iconClass} text-success fa-3x mb-3`} />

              {/* <img
                src="https://via.placeholder.com/150"
                alt={product}
                className="img-fluid rounded-circle mb-3"
              /> */}
              <h5 className="card-title">
                <a href="/" className="text-success">
                  {product.name}
                </a>
              </h5>
              <p className="card-text">
                   {product.description}
              </p>
            </div>
          </Card>
        </Col>
      ))}
    </Row>
    </div>
  );
};

export default ProductListComponent;
