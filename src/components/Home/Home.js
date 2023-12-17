import back2 from '../../images/header.jpg';
import softwareImage from '../../images/banner.png';
function Home(){
  const backgroundStyle = {
    backgroundImage: `url(${back2})`,
    backgroundSize: 'cover',
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'center',
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center', // Center vertically
    justifyContent: 'center', // Center horizontally
    color: 'green', // Set text color
  };
return(
    <>
        <section className="mt-5" style={backgroundStyle}>
            <div className="container mt-5">
              <div className="row">
                <div className="col-md-6 text-center py-4 mt-5">
                  <h1 className="text-center display-6 font-weight-bold text-success">Computer Solutions</h1>
                  <p className="lead text-light">
                    Explore our comprehensive services in cyber services, web development, software development, graphic design, branding, and computers. Empower your digital journey with our expertise.
                  </p>
                  <button className="btn btn-success btn-lg text-light">Get Started</button>
                </div>
                <div className="col-md-6 text-center">
                  <img src={softwareImage} alt="Software" className="img-fluid mt-5"  />
                </div>
              </div>
            </div>
          </section>

    </>
)
}
export default Home;