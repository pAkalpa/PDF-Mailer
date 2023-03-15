use lettre::message::{Attachment, Body, MultiPart};
use lettre::transport::smtp::authentication::Credentials;
use lettre::{Message, SmtpTransport, Transport};
use std::fs;

fn main() {
    let pdf = fs::read("path to file/attachment").unwrap();
    let pdf_body = Body::new(pdf);

    let email = Message::builder()
        .from("Sender's Name <sender@example.com>".parse().unwrap())
        .to("Receiver's Name <receiver@example.com>".parse().unwrap())
        .subject("Mail Subject")
        .multipart(
            MultiPart::mixed().multipart(
                MultiPart::alternative().singlepart(
                    Attachment::new(String::from("Attachment Name"))
                        .body(pdf_body, "application/pdf".parse().unwrap()),
                ),
            ),
        )
        .unwrap();

    let creds = Credentials::new(
        "sender's email address".to_owned(),
        "password/apppassword".to_owned(),
    );

    let mailer = SmtpTransport::relay("smtp.gmail.com")
        .unwrap()
        .credentials(creds)
        .build();

    match mailer.send(&email) {
        Ok(_) => println!("Email sent successfully!"),
        Err(e) => panic!("Could not send email: {e:?}"),
    }
}
