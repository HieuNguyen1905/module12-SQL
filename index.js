const inquirer = require('inquirer');
const mysql = require('mysql2');
const { allowedNodeEnvironmentFlags } = require('process');
const cTable = require('console.table');


const db = mysql.createConnection(
    {
      host: '127.0.0.1',
      user: 'root',
      password: 'password',
      database: 'company_db'
    },
    console.log(`Connected to the movies_db database.`)
);

const main = ()=> {
    inquirer.prompt([
        {
            type:'list',
            name:'question',
            message:'What would you like to do?',
            choices:['View All Employees','Add Employee','Update Employee Role','View All Roles','Add Role','View All Departments','Add Departments']
        }
    ]).then((ans)=>{
        if(ans.question =='Add Departments'){
            addDepartment();
        }
        if(ans.question == 'Add Role'){
            addRole();
        }
        if(ans.question == 'View All Departments'){
            viewDepartment();
        }
        if(ans.question == 'View All Roles'){
            viewRole();
        }
        if(ans.question =='Add Employee'){
            addEmployee();
        }
        if(ans.question =='View All Employees'){
            viewEmployee();
        }
        if(ans.question =='Update Employee Role'){
            updateEmployee();
        }
    })
}

const updateEmployee = () =>{
    
    const nameArr = [];
    db.query(`SELECT first_name, last_name FROM employee`,(err,result2)=>{
        if(err){
            throw err;
        }
        for(let i = 0; i < result2.length ; i++){
            const name = (result2[i].first_name).concat(" ",result2[i].last_name)
            nameArr.push(name);
        
        }
    
        inquirer.prompt([
            {
                type: 'list',
                name:'name',
                message: 'Which employee do you want to update?',
                choices: nameArr,
            }
        ]).then((data)=>{
            let index;
            for(let i = 0 ; i < nameArr.length; i++){
                if(data.name == nameArr[i]){
                    index = i
                }
            }
            const roleArray = []
            db.query(`SELECT title FROM role`,(err,result)=>{
                if(err){
                    throw err;
                }
                for(let i = 0; i < result.length ; i++){
                    roleArray.push(result[i].title);
                }
                inquirer.prompt([
                    {
                        type: 'list',
                        name:'choiceRole',
                        message: 'Which role do you want to assign the selected employee?',
                        choices: roleArray,
                    }
                ]).then((ans)=>{
                    
                    const sqlE3 = `SELECT id FROM role WHERE title = ?`
                    db.query(sqlE3,ans.choiceRole,(err,result)=>{
                        if (err){
                            throw err;
                        }
                        console.log(result[0].id)
                        const sqlH3 = `UPDATE employee SET role_id = ? WHERE id = ?`
                        db.query(sqlH3,[result[0].id,(index+1)],(err,result)=>{
                            if (err){
                                throw err;
                            }
                            viewEmployee();
                        })
                    })
                })
            })
        })
    })
}

const viewEmployee = () =>{
    db.query('SELECT role.title AS title, department.department_name AS department, role.salary, employee.id, employee.first_name, employee.last_name, employee.manager_name FROM employee LEFT JOIN role ON employee.role_id = role.id LEFT JOIN department ON role.department_id = department.id',(err,result)=>{
        if(err){
            throw err;
        }
        
        console.table(result);
        main();
    });
}

const addEmployee = () =>{
    inquirer.prompt([
        {
            type: 'input',
            name:'firstName',
            message: 'What is the first name of employee?',
        },
        {
            type: 'input',
            name:'lastName',
            message: 'What is the last name of employee?',
        },

    ]).then((data)=>{
        const roleArray = []
        db.query(`SELECT title FROM role`,(err,result2)=>{
            if(err){
                throw err;
            }
            for(let i = 0; i < result2.length ; i++){
                roleArray.push(result2[i].title);
            }
            inquirer.prompt([
                {
                    type: 'list',
                    name:'choiceRole',
                    message: 'What is employee role?',
                    choices: roleArray,
                }
            ]).then((ans)=>{
                const managerArr = ['None']
                db.query(`SELECT first_name, last_name FROM employee`,(err,result2)=>{
                    if(err){
                        throw err;
                    }
                    for(let i = 0; i < result2.length ; i++){
                        const name = (result2[i].first_name).concat(" ",result2[i].last_name)
                        managerArr.push(name);
                    }
                    
                    inquirer.prompt([
                        {
                            type: 'list',
                            name:'manager',
                            message: 'Who is this employee manager?',
                            choices: managerArr,
                        },
                    ]).then((ans2)=>{
                        if(ans2.manager == 'None'){
                            const sqlE3 = `SELECT id FROM role WHERE title = ?`
                            db.query(sqlE3,ans.choiceRole,(err,result)=>{
                                if (err){
                                    throw err;
                                }
                                
                                const sqlE1 = `INSERT INTO employee SET ?`;
                                db.query(sqlE1,{first_name:data.firstName, last_name:data.lastName , role_id:result[0].id, manger_id:null},(err,result)=>{
                                if (err){
                                    throw err;
                                }
                                viewEmployee()
                                })
                            })
                        }else{
                            let index;
                            for(let i = 1 ; i <= managerArr.length; i++){
                                if(ans2.manager == managerArr[i]){
                                    index = i
                                }
                            }
                            const sqlE3 = `SELECT id FROM role WHERE title = ?`
                            db.query(sqlE3,ans.choiceRole,(err,result)=>{
                                if (err){
                                    throw err;
                                }
                                    const sqlE1 = `INSERT INTO employee SET ?`;
                                    db.query(sqlE1,{first_name:data.firstName, last_name:data.lastName , role_id:result[0].id, manger_id:index, manager_name:managerArr[index]},(err,result)=>{
                                    if (err){
                                        throw err;
                                    }
                                    viewEmployee()
                                    })
                                
                            })
                        }
                    })
                })
            })
             
        })
    })
}

const viewRole = () =>{
    db.query('SELECT department.department_name AS department, role.id, role.title, role.salary FROM role LEFT JOIN department ON role.department_id = department.id',(err,result)=>{
        if(err){
            throw err;
        }
        console.table(result);
        main();
    });
}

const viewDepartment = () =>{
    db.query('SELECT * FROM department',(err,result)=>{
        if(err){
            throw err;
        }
        console.table(result);
        main();
    });
}

const addDepartment = () =>{
    inquirer.prompt([
        {
            type: 'input',
            name:'nameDept',
            message: 'What is the name of the department?',
        }
    ]).then(data=>{
        const sql = `INSERT INTO department (department_name) VALUE (?)`;
        db.query(sql,data.nameDept, (err,result)=>{
            if (err){
                throw err;
            }
            viewDepartment();
        })
    }) 
}

const addRole = () =>{
    inquirer.prompt([
        {
            type: 'input',
            name:'nameRole',
            message: 'What is the name of the role?',
        },
        {
            type: 'input',
            name:'salary',
            message: 'What is the salary of the role?',
        },

    ]).then((data)=>{
        const departmentArray = []
        db.query(`SELECT department_name FROM department`,(err,result)=>{
            if(err){
                throw err;
            }
            for(let i = 0; i < result.length ; i++){
                departmentArray.push(result[i].department_name);
            }
            inquirer.prompt([
                {
                    type: 'list',
                    name:'choiceDept',
                    message: 'Which department does the role belong to?',
                    choices: departmentArray,
                }
            ]).then((ans)=>{
                const sqlR3 = `SELECT id FROM department WHERE department_name = ?`
                db.query(sqlR3,ans.choiceDept,(err,result)=>{
                    if (err){
                        throw err;
                    }
                    const sqlR1 = `INSERT INTO role SET ?`;
                    db.query(sqlR1,{title:data.nameRole,salary:parseInt(data.salary),department_id:result[0].id},(err,result)=>{
                        if (err){
                            throw err;
                        }
                        viewRole()
                    })
                 })
             })
             
        })
    })    
}

main();