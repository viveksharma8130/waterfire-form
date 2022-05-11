import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { Col, Container, Form, FormGroup, Row } from "reactstrap";
import { Card, IconButton } from "@material-ui/core";

//Icons
import KeyboardArrowLeftIcon from "@material-ui/icons/KeyboardArrowLeft";
import KeyboardArrowRightIcon from "@material-ui/icons/KeyboardArrowRight";
import SendIcon from "@material-ui/icons/Send";

// Form Api
import formData from "./form.json";
import "./index.css";

const RenderCheckbox = ({ register, fields }) => {
  return (
    <Col lg="12">
      <h3>{fields[0].name}</h3>
      {fields[0].option.map((field) => (
        <div className="custom-control custom-checkbox mb-3" key={field.id}>
          <input
            type="checkbox"
            className="custom-control-input"
            {...register(field?.name ?? field?.optionKey ?? field.question)}
            id={"mycheckbox" + field.id}
            value={field?.name ?? field?.optionKey ?? field.question}
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

const RadioInput = ({ options, register, name }) => {
  return (
    <Col lg="12">
      <h3>{name}</h3>
      {options.map((opt) => (
        <div className="custom-control custom-radio mb-3" key={opt.id}>
          <input
            className="custom-control-input"
            type="radio"
            {...register(name)}
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
          name={field.question}
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
            {field.question ===
            "Have you worked with any agency in the past?" ? null : (
              <label>{field.question}</label>
            )}
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

  useEffect(() => {
    const subscription = watch((value, { name, type }) => {
      if (!watchableFieldNames.includes(name)) return;
      // grab the value
      const isChecked = value[name];

      if (isChecked) {
        // remove the contact form from last idx
        const contactComp = [pages.current.pop(), pages.current.pop()];
        formData[name].forEach(({ name, options }) => {
          pages.current.push({
            name,
            component: (
              <RadioInput name={name} register={register} options={options} />
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
      // console.log(pages.current);
      // console.log(name, type, value);
    });
    return () => subscription.unsubscribe();
  }, [watch, register]);

  const submit = (values) => {
    for (const [keys, value] of Object.entries(values)) {
      console.log(keys, ":", value);
    }
  };

  return (
    <div className="service_form">
      <div className="service_forms">
        <Container>
          <Row>
            <Col className="col-lg-12">
              <Card className="myshadow">
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
              </Card>
            </Col>
          </Row>
        </Container>
      </div>
    </div>
  );
};

export default App;
