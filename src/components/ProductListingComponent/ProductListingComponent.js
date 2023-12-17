import React from 'react';
import { Card, Row, Col } from 'react-bootstrap';

const ProductListComponent = () => {
  const products = [
    'Laptops',
    'Desktops',
    'Monitors',
    'Keyboards',
    'Cables',
    'Mouse',
  ];

  return (
    <div className='text-center text-3xl'>
        <h4 className="text-success text-center display-5 font-weight-bolder " href="/">
           Computers and Accessories
        </h4>
    <Row className="mt-4 p-2">
      {products.map((product, index) => (
        <Col key={index} md={6} lg={4}>
          <Card className="shadow-lg rounded text-center m-2">
            <div className="card-body">
              {/* You can replace the placeholder image with an actual product image */}
              <img
                src="https://via.placeholder.com/150"
                alt={product}
                className="img-fluid rounded-circle mb-3"
              />
              <h5 className="card-title">
                <a href="/" className="text-success">
                  {product}
                </a>
              </h5>
              <p className="card-text">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor
                incididunt ut labore et dolore magna aliqua.
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
