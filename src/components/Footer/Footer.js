function Footer(){
    const style={
        alignItems: 'center',
    }
return(
    <footer className=" bg-success text-light text-center p-4" style={style}>  
    <div class="container">
    <div class="row">
  <div class="col-md-2 col-sm-6 mt-2 d-flex flex-column text-left">
    <h5 class="text-light font-weight-bold">Products</h5>
    <a class="text-light" href="/">Cyber Services</a>
    <a class="text-light" href="/">Software Development</a>
    <a class="text-light" href="/">Online Services</a>
    <a class="text-light" href="/">Computers and accessories</a>
  </div>
  <div class="col-md-2 col-sm-6 mt-2 d-flex flex-column text-left">
    <h5 class="text-light font-weight-bold">Resources</h5>
    <a class="text-light" href="/">Support</a>
    <a class="text-light" href="/">Developers</a>
    <a class="text-light" href="/">Github</a>
    <a class="text-light" href="/">Status</a>
  </div>
  <div class="col-md-2 col-sm-6 mt-2 d-flex flex-column text-left">
    <h5 class="text-light font-weight-bold">Company</h5>
    <a class="text-light" href="/">Our story</a>
    <a class="text-light" href="/">Contact us</a>
    <a class="text-light" href="/">Careers</a>
  </div>
  <div class="col-md-4 col-sm-12 mt-2 d-flex flex-column text-left">
    <h5 class="text-light font-weight-bold">Legal</h5>
    <a class="text-light" href="/">Terms of service</a>
    <a class="text-light" href="/">Privacy policy</a>
    <a class="text-light" href="/">Service Level Agreement</a>
    <a class="text-light" href="/">Code of Conduct</a>
    <a class="text-light" href="/">Marketplace Terms of service</a>
  </div>
  <div class="col-md-2 col-sm-6 mt-2 d-flex flex-column text-left">
    <h5 class="text-light font-weight-bold">Find us</h5>
    <a class="text-light" href="/">Facebook</a>
    <a class="text-light" href="/">Twitter</a>
    <a class="text-light" href="/">Instagram</a>
    <a class="text-light" href="/">Linkedin</a>
  </div>
</div>

        </div>      
        <p className="container mt-3 border-top border-5">&copy; 2023 ikonex computer solutions. All rights reserved.</p>
    </footer>
)
}
export default Footer;