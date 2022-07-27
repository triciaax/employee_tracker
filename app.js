var inquirer = require("inquirer");
const { allowedNodeEnvironmentFlags } = require("process");
const mysql = require("mysql2");

const connection = mysql.createConnection({
  host: "localhost",
  user: "tracker",
  password: "devpassword",
  database: "employee_tracker",
});

const promptUser = () => {
  return (
    inquirer
      .prompt([
        {
          type: "list",
          name: "name",
          message: "what would you like to do?",
          choices: [
            "View all Employees",
            "Add Employee",
            "Update Employee Role",
            "View All Roles",
            "Add Role",
            "View All Departments",
            "Add Department",
            "Quit",
          ],
        },
      ])

      // responses to answers
      .then((answers) => {
        const { name } = answers;
        if (name === "View all Employees") {
          viewEmployees();
        }

        if (name === "Add Employee") {
          addEmployee();
        }

        if (name === "View All Roles") {
          viewRoles();
        }

        if (name === "Add Role") {
          addRole();
        }

        if (name === "View All Departments") {
          viewDepartments();
        }

        if (name === "Add Department") {
          addDepartment();
        }

        if (name === "Update Employee Role") {
          updateEmployeeRole();
        }
      })
  );
};

//function to show all data on selected table
viewDepartments = () => {
  const sql = `SELECT department.id AS id, department.name AS department 
    FROM department`;

  connection.query(sql, (err, rows) => {
    if (err) throw err;
    console.table(rows);
    promptUser();
  });
};

viewRoles = () => {
  const sql = `SELECT role.id, role.title, department.name AS department
    FROM role
    INNER JOIN department ON role.department_id = department.id`;

  connection.query(sql, (err, rows) => {
    if (err) throw err;
    console.table(rows);
    promptUser();
  });
};

viewEmployees = () => {
  const sql = `SELECT employee.id, 
                        employee.first_name, 
                        employee.last_name, 
                        role.title, 
                        department.name AS department,
                        role.salary, 
                        CONCAT (manager.first_name, " ", manager.last_name) AS manager
                 FROM employee
                        LEFT JOIN role ON employee.role_id = role.id
                        LEFT JOIN department ON role.department_id = department.id
                        LEFT JOIN employee manager ON employee.manager_id = manager.id`;
  connection.query(sql, (err, rows) => {
    if (err) throw err;
    console.table(rows);
    promptUser();
  });
};

//functions to add a data point
//function to add an employee
addEmployee = () => {
  inquirer
    .prompt([
      {
        type: "input",
        name: "fistName",
        message: "What is the employee's first name?",
        validate: (addFirst) => {
          if (addFirst) {
            return true;
          } else {
            console.log("Please enter a first name");
            return false;
          }
        },
      },
      {
        type: "input",
        name: "lastName",
        message: "What is the employee's last name?",
        validate: (addLast) => {
          if (addLast) {
            return true;
          } else {
            console.log("Please enter a last name");
            return false;
          }
        },
      },
    ])
    .then((answer) => {
      const params = [answer.fistName, answer.lastName];

      //get roles from roles table
      const roleSql = `SELECT role.id, role.title FROM role`;

      connection.query(roleSql, (err, data) => {
        if (err) throw err;

        const roles = data.map(({ id, title }) => ({ name: title, value: id }));

        inquirer
          .prompt([
            {
              type: "list",
              name: "role",
              message: "What is the employee's role?",
              choices: roles,
            },
          ])
          .then((roleChoice) => {
            const role = roleChoice.role;
            params.push(role);

            const managerSql = `SELECT * FROM employee`;

            connection.query(managerSql, (err, data) => {
              if (err) throw err;

              const managers = data.map(({ id, first_name, last_name }) => ({
                name: first_name + " " + last_name,
                value: id,
              }));

              // console.log(managers);

              inquirer
                .prompt([
                  {
                    type: "list",
                    name: "manager",
                    message: "Who is the employee's manager?",
                    choices: managers,
                  },
                ])
                .then((managerChoice) => {
                  if (managerChoice.manager) {
                    const manager = managerChoice.manager;
                    params.push(manager);
                  } else {
                    params.push("");
                  }

                  const sql = `INSERT INTO employee (first_name, last_name, role_id, manager_id)
                      VALUES (?, ?, ?, ?)`;

                  connection.query(sql, params, (err, result) => {
                    if (err) throw err;
                    console.log("Employee has been added");

                    viewEmployees();
                  });
                });
            });
          });
      });
    });
};

// function to add a department
addDepartment = () => {
  inquirer
    .prompt([
      {
        type: "input",
        name: "addDept",
        message: "What department do you want to add?",
        validate: (addDept) => {
          if (addDept) {
            return true;
          } else {
            console.log("Please enter a department");
            return false;
          }
        },
      },
    ])
    .then((answer) => {
      const sql = `INSERT INTO department (name)
                    VALUES (?)`;
      connection.query(sql, answer.addDept, (err, result) => {
        if (err) throw err;
        console.log("Added " + answer.addDept + " to departments!");

        viewDepartments();
      });
    });
};

//function to add a role
addRole = () => {
  inquirer
    .prompt([
      {
        type: "input",
        name: "role",
        message: "What role do you want to add?",
        validate: (addRole) => {
          if (addRole) {
            return true;
          } else {
            console.log("Please enter a role");
            return false;
          }
        },
      },
      {
        type: "input",
        name: "salary",
        message: "What is the salary of this role?",
        validate: (addSalary) => {
          if (parseInt(addSalary)) {
            return true;
          } else {
            console.log("Please enter a salary");
            return false;
          }
        },
      },
    ])
    .then((answer) => {
      const params = [answer.role, answer.salary];

      //get dept from department table
      const roleSql = `SELECT name, id FROM department`;

      connection.query(roleSql, (err, data) => {
        if (err) throw err;

        const dept = data.map(({ name, id }) => ({ name: name, value: id }));

        inquirer
          .prompt([
            {
              type: "list",
              name: "dept",
              message: "What department is this role in?",
              choices: dept,
            },
          ])
          .then((deptChoice) => {
            const dept = deptChoice.dept;
            params.push(dept);

            const sql = `INSERT INTO role (title, salary, department_id)
                          VALUES (?, ?, ?)`;

            connection.query(sql, params, (err, result) => {
              if (err) throw err;
              viewRoles();
            });
          });
      });
    });
};

//function to add a department
addDepartment = () => {
  inquirer
    .prompt([
      {
        type: "input",
        name: "addDept",
        message: "What department do you want to add?",
        validate: (addDept) => {
          if (addDept) {
            return true;
          } else {
            console.log("Please enter a department");
            return false;
          }
        },
      },
    ])
    .then((answer) => {
      const sql = `INSERT INTO department (name)
                    VALUES (?)`;
      connection.query(sql, answer.addDept, (err, result) => {
        if (err) throw err;
        console.log("Added " + answer.addDept + " to departments!");

        viewDepartments();
      });
    });
};

updateEmployeeRole = () => {
  const getEmployeeSql = `SELECT * from employee`;
  connection.query(getEmployeeSql, (err, result) => {
    if (err) throw err;
    const employees = result.map(({ id, first_name, last_name }) => ({
      name: first_name + " " + last_name,
      value: id,
    }));

    inquirer
      .prompt([
        {
          type: "list",
          name: "name",
          message: "Which employee's role would you like to update?",
          choices: employees,
        },
      ])
      .then((choice) => {
        const employee = choice.name;
        var params = [employee];

        const getRoleSql = `SELECT * FROM role`;
        connection.query(getRoleSql, (err, result) => {
          if (err) throw err;
          const roles = result.map(({ id, title }) => ({
            name: title,
            value: id,
          }));

          inquirer
            .prompt([
              {
                type: "list",
                name: "role",
                message: "What is the employee's new role?",
                choices: roles,
              },
            ])
            .then((choice) => {
              const role = choice.role;
              params.push(role);
              params = params.reverse();
              const updateSql = "UPDATE employee SET role_id = ? WHERE id = ?";
              connection.query(updateSql, params, (err, result) => {
                if (err) throw err;
                console.log("Employee role updated.");
                viewEmployees();
              });
            });
        });
      });
  });
};

promptUser();
