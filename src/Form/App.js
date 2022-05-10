import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { Col, Container, Form, Row } from "reactstrap";
import { Card, IconButton } from "@material-ui/core";

//Icons
import KeyboardArrowLeftIcon from "@material-ui/icons/KeyboardArrowLeft";
import KeyboardArrowRightIcon from "@material-ui/icons/KeyboardArrowRight";
import SendIcon from "@material-ui/icons/Send";

// Form Api
import formData from "./form.json";
import "./index.css";

const RenderCheckbox = ({ register, fields }) => {
  return fields.map((field, idx) => {
    return (
      <div className="custom-control custom-checkbox mb-3" key={idx}>
        <input
          type="checkbox"
          className="custom-control-input"
          {...register(field?.name ?? field?.optionKey ?? field.question)}
          id={"mycheckbox" + field.id}
        />
        <label
          className="custom-control-label"
          htmlFor={"mycheckbox" + field.id}
        >
          {field.question}
        </label>
      </div>
    );
  });
};

const RadioInput = ({ options, register, name }) => {
  return options.map((opt, idx) => (
    <div className="custom-control custom-radio mb-3" key={idx}>
      <input
        name={name}
        className="custom-control-input"
        type="radio"
        {...register(name)}
        id={"myradio" + opt.id}
      />
      <label
        key={idx}
        className="custom-control-label"
        htmlFor={"myradio" + opt.id}
      >
        {opt.question}
      </label>
    </div>
  ));
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
        <div>
          <textarea
            {...register(field.question)}
            className="form-control"
            placeholder="Type here..."
            rows="5"
          />
          <br />
          <br />
          <br />
          <br />
          <br />
        </div>
      );

    case "static":
      return null;

    default:
      return (
        <input
          {...register(field.question)}
          type={field.type}
          className="form-control"
          placeholder={field.placeholder}
        />
      );
  }
};

const ContactForm = ({ register, fields }) => {
  return fields.map((field) => {
    return (
      <div className="contact-input-container" key={field.id}>
        <label>{field.question}</label>
        {renderContactInput(field, register)}
      </div>
    );
  });
};

// extract the names of field which we want to watch
const watchableFields = formData.step2.filter((item) => item?.optionKey);
const watchableFieldNames = watchableFields.map((item) => item.optionKey);

function App() {
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
    console.log(values);
  };
  return (
    <div className="service_form">
      <div className="service_forms">
        <Container>
          <Row>
            <Col className="col-lg-12">
              <Card className="myshadow">
                <Form>
                  <div className="form_inner_wrap">
                    <div className="form">
                      <div className="input-container">
                        {pages.current[currentPage].component}
                      </div>
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
                          <IconButton onClick={handleSubmit(submit)}>
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
}

export default App;
