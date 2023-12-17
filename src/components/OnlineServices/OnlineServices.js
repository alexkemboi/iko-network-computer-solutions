import React from 'react';
import { Card, Row, Col } from 'react-bootstrap';
const OnlineServices = () => {
    const kenyanGovernmentServices = [
        {
          name: 'Email',
          description: 'Government email services for official communication and collaboration. Stay connected and secure with our email solutions.',
          iconClass: 'fas fa-envelope'
        },
        {
          name: 'KRA (Kenya Revenue Authority)',
          description: 'Tax services and revenue collection for individuals and businesses. Fulfill your tax obligations efficiently with KRA services.',
          iconClass: 'fas fa-file-invoice-dollar'
        },
        {
          name: 'eCitizen',
          description: 'A one-stop portal for various government services. Access and apply for a range of services online with eCitizen.',
          iconClass: 'fas fa-user-cog'
        },
        {
          name: 'KUCCPS (Kenya Universities and Colleges Central Placement Service)',
          description: 'Facilitating the placement of students into universities and colleges. Check your placement status and access related services.',
          iconClass: 'fas fa-graduation-cap'
        },
        {
          name: 'NTSA (National Transport and Safety Authority)',
          description: 'Services related to road transport, including vehicle registration and licensing. Stay compliant with NTSA regulations.',
          iconClass: 'fas fa-car'
        },
        {
          name: 'TIMS (Transport Integrated Management Systems)',
          description: 'An online platform for managing transport-related services. Access vehicle inspection, licensing, and other transport services.',
          iconClass: 'fas fa-truck'
        },
        {
          name: 'GHRIS (Government Human Resource Information System)',
          description: 'Human resource management services for government employees. Access your HR information, payroll, and related services.',
          iconClass: 'fas fa-user-tie'
        },
        {
          name: 'Payslips',
          description: 'Online access to government employee payslips. View and download your monthly payslips securely.',
          iconClass: 'fas fa-money-check-alt'
        },
        {
          name: 'CRB (Credit Reference Bureau)',
          description: 'Access credit reports and related financial information. Stay informed about your creditworthiness with CRB services.',
          iconClass: 'fas fa-chart-line'
        },
        {
          name: 'HELB (Higher Education Loans Board)',
          description: 'Providing loans and scholarships to Kenyan students pursuing higher education. Manage your HELB loans and applications online.',
          iconClass: 'fas fa-graduation-cap'
        }
      ];
      
    
  return (
    <div className='text-center text-3xl ' >
        <h4 className="text-light text-center display-5 font-weight-bolder " href="/">
          Online Services
        </h4>
    <Row className="mt-4 p-2">
      {kenyanGovernmentServices.map((kenyanGovernmentServices, index) => (
        <Col key={index} md={6} lg={3}>
          <Card className="shadow-lg rounded text-center m-2">
            <div className="card-body">
            <i className={`fas ${kenyanGovernmentServices.iconClass} text-success fa-3x mb-3`} />
              
              
              <h5 className="card-title">
                <a href="/" className="text-success">
                  {kenyanGovernmentServices.name}
                </a>
              </h5>
              <p className="card-text">
                  {kenyanGovernmentServices.description}
              </p>
            </div>
          </Card>
        </Col>
      ))}
    </Row>
    </div>
  );
};

export default OnlineServices;
