import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { Col, Container, Form, FormGroup, Row } from "reactstrap";
import { Card, IconButton } from "@material-ui/core";
import emailjs from "emailjs-com";

//Icons
import KeyboardArrowLeftIcon from "@material-ui/icons/KeyboardArrowLeft";
import KeyboardArrowRightIcon from "@material-ui/icons/KeyboardArrowRight";
import SendIcon from "@material-ui/icons/Send";
import CheckCircleIcon from "@material-ui/icons/CheckCircle";

// Form Api
import formData from "./form.json";
import "./index.css";

const RenderCheckbox = ({ register, fields, name }) => {
  return (
    <Col lg="12">
      <h3>{fields[0].name}</h3>
      {fields[0].option.map((field, idx) => (
        <div className="custom-control custom-checkbox mb-3" key={field.id}>
          <input
            type="checkbox"
            className="custom-control-input"
            value={field.question}
            {...register(
              `${fields[0].inputName}${field.optionKey ? "@" : ""}${
                field.optionKey ?? ""
              }`
            )}
            id={"mycheckbox" + field.id}
          />
          <label
            className="custom-control-label"
            htmlFor={"mycheckbox" + field.id}
          >
            {field.question}
          </label>
        </div>
      ))}
    </Col>
  );
};

const RadioInput = ({ options, register, name, inputName }) => {
  return (
    <Col lg="12">
      <h3>{name}</h3>
      {options.map((opt) => (
        <div className="custom-control custom-radio mb-3" key={opt.id}>
          <input
            className="custom-control-input"
            type="radio"
            {...register(inputName)}
            value={opt.question}
            id={"myradio" + opt.id}
          />
          <label
            key={opt.id}
            className="custom-control-label"
            htmlFor={"myradio" + opt.id}
          >
            {opt.question}
          </label>
        </div>
      ))}
    </Col>
  );
};

const renderContactInput = (field, register) => {
  switch (field.type) {
    case "radio":
      return (
        <RadioInput
          register={register}
          name={field.name}
          inputName={field.inputName}
          options={field.options}
        />
      );

    case "textarea":
      return (
        <>
          <textarea
            {...register(field.name)}
            className="form-control"
            placeholder="Type here..."
            rows="5"
          />
          <br />
          <br />
          <br />
          <br />
          <br />
        </>
      );

    case "static":
      return null;

    default:
      return (
        <FormGroup>
          <input
            {...register(field.name)}
            type={field.type}
            className="form-control"
            placeholder={field.placeholder}
          />
        </FormGroup>
      );
  }
};

const ContactForm = ({ register, fields }) => {
  return (
    <>
      {fields[0].id === "contact-1" ? null : (
        <Col lg="12">
          <h3>Share your details</h3>
        </Col>
      )}
      {fields.map((field) => (
        <Col
          lg={field.type === "textarea" || field.id === "contact-1" ? 12 : 6}
          key={field.id}
        >
          <div className="contact-input-container">
            <label>{field.question}</label>
            {renderContactInput(field, register)}
          </div>
        </Col>
      ))}
    </>
  );
};

// extract the names of field which we want to watch
const watchableFields = formData.step2[0].option.filter(
  (item) => item?.optionKey
);
const watchableFieldNames = watchableFields.map((item) => item.optionKey);

const App = () => {
  const { register, watch, handleSubmit } = useForm();

  // const watchFields = watch();

  // console.log(watchFields);
  const pages = useRef([
    {
      name: "step1",
      component: <RenderCheckbox register={register} fields={formData.step1} />,
    },
    {
      name: "step2",
      component: <RenderCheckbox register={register} fields={formData.step2} />,
    },
    {
      name: "worked_with_agency",
      component: (
        <ContactForm register={register} fields={formData.worked_with_agency} />
      ),
    },
    {
      name: "contact_details",
      component: (
        <ContactForm register={register} fields={formData.contact_details} />
      ),
    },
  ]);

  // states
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(pages.current.length);
  const [messageSend, setMessageSend] = useState(false);

  useEffect(() => {
    const subscription = watch((value, { name, type }) => {
      // console.log("form", value, name);
      const optionKey = name.split("@")[1];
      if (!watchableFieldNames.includes(optionKey)) return;
      // grab the value
      const isChecked = value[name];

      console.log(name);
      if (isChecked) {
        // remove the contact form from last idx
        const contactComp = [
          pages.current.pop(),
          pages.current.pop(),
        ].reverse();

        formData[optionKey].forEach((item) => {
          pages.current.push({
            name,
            component: (
              <RadioInput
                name={item.name}
                inputName={item.inputName}
                register={register}
                options={item.options}
              />
            ),
          });
        });
        // add contact to end again
        pages.current.push(...contactComp);
        // get the length from json
      } else {
        pages.current = pages.current.filter((page) => page.name !== name);
        // get the length from json
      }
      setTotalPages(pages.current.length);
    });
    return () => subscription.unsubscribe();
  }, [watch, register]);

  const submit = async (data) => {
    for (const key in data) {
      const val = data[key];
      if (val === false || val.includes(false)) {
        delete data[key];
      }
      if (key.includes("@")) {
        const [name] = key.split("@");
        if (data.hasOwnProperty(name) && Array.isArray(data[name])) {
          // put the original value only if its true
          val && data[name].push(val);
        } else {
          data[name] = [val];
        }
        delete data[key];
      }
    }

    for (const key in data) {
      const arrVals = data[key];
      if (Array.isArray(arrVals)) {
        data[key] = arrVals.join(", ");
      }
    }
    console.log(data);
    try {
      const ser = "service_ai95l5u";
      const temps = "template_rl6by88";
      const users = "user_ySvYJMjB8dCxYhy6bksDq";
      const res = await emailjs.send(ser, temps, data, users);
      if (res.status === 200) {
        setMessageSend(true);
      } else {
        setMessageSend(false);
      }
    } catch (e) {
      console.log(e);
    }
  };

  return (
    <div className="service_form">
      <div className="service_forms">
        <Container>
          <Row>
            <Col className="col-lg-12">
              <Card className="myshadow">
                {messageSend ? (
                  <div className="form_inner_wrap">
                    <div className="form">
                      <div className="successmsg">
                        <div className="icon">
                          <CheckCircleIcon fontSize="large" />
                        </div>
                        <div className="info">
                          <h3>Thank you for contacting Waterfire!</h3>
                          <p>
                            We’re very excited to hear from you! Your message is
                            in good hands. In the meantime, learn more about
                            what makes us the best digital marketing company,
                            and follow us on social media!
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <Form method="post" onSubmit={handleSubmit(submit)}>
                    <div className="form_inner_wrap">
                      <div className="form">
                        <Row>
                          {pages.current[currentPage].component}
                          <div className="action_btn">
                            <IconButton
                              onClick={() => setCurrentPage(currentPage - 1)}
                              disabled={!currentPage}
                            >
                              <KeyboardArrowLeftIcon
                                fontSize="large"
                                className="icons"
                              />
                            </IconButton>
                            {currentPage === totalPages - 1 ? (
                              <IconButton type="submit">
                                <SendIcon fontSize="large" className="icons" />
                              </IconButton>
                            ) : null}

                            <IconButton
                              onClick={() => setCurrentPage(currentPage + 1)}
                              className={
                                currentPage === totalPages - 1
                                  ? "d-none"
                                  : "d-block"
                              }
                            >
                              <KeyboardArrowRightIcon
                                fontSize="large"
                                className="icons"
                              />
                            </IconButton>
                            {/* <button
                          // disable button when current page idx is 0
                          disabled={!currentPage}
                          onClick={() => setCurrentPage(currentPage - 1)}
                          type="button"
                        >
                          Previous
                        </button>
                        <button
                          disabled={currentPage === totalPages - 1}
                          onClick={() => setCurrentPage(currentPage + 1)}
                          type="button"
                        >
                          Next
                        </button> */}
                          </div>
                        </Row>
                      </div>
                    </div>
                  </Form>
                )}
              </Card>
            </Col>
          </Row>
        </Container>
      </div>
    </div>
  );
};

export default App;
