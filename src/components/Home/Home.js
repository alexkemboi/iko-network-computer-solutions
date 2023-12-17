import back2 from '../../images/bodybackground.gif';
import softwareImage from '../../images/pc.png';
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
        <section style={backgroundStyle}>
  <div className="container mt-5">
    <div className="row">
      <div className="col-md-6 text-center py-4">
        <h1 className="text-center display-6 font-weight-bold">Computer Solutions</h1>
        <p className="lead">
          Explore our comprehensive services in cyber services, web development, software development, graphic design, branding, and computers. Empower your digital journey with our expertise.
        </p>
        <button className="btn btn-success btn-lg">Get Started</button>
      </div>
      <div className="col-md-6 text-center">
        <img src={softwareImage} alt="Software" className="img-fluid" />
      </div>
    </div>
  </div>
</section>

    </>
)
}
export default Home;