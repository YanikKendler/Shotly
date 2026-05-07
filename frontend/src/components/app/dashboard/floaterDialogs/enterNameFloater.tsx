import TextField from "@/components/basic/textField/textField"
import {useState} from "react"
import {wuConstants} from "@yanikkendler/web-utils/dist"
import gql from "graphql-tag"
import {errorNotification} from "@/service/NotificationService"
import {useApolloClient} from "@apollo/client"

export default function EnterNameFloater({
    hideFloater
}:{
    hideFloater: () => void
}){
    const client = useApolloClient()

    const [newName, setNewName] = useState<string>("")

    const handleNewUserNameSubmit = () => {
        if(wuConstants.Regex.empty.test(newName)) return

        client.mutate({
                mutation: gql`
                    mutation updateUser($name: String!){
                        updateUser(editDTO: {
                            name: $name
                        }) {
                            id
                            name
                        }
                    }`,
                variables: {name: newName.trim()},
            },
        ).then(({errors}) => {
            if(errors) {
                errorNotification({
                    title: "Failed to update Username",
                    tryAgainLater: true
                })
                console.error("Error updating username:", errors);
            }
        })

        hideFloater()
    }

    return (
        <div className="enterName">
            <h3>Welcome</h3>
            <p>
                <span className="bold">Please enter your name (or nickname).</span>
                <br/>
                <span className="gray">This name will be visible to others and can not be used to log in.</span>
            </p>
            <TextField
                value={newName}
                valueChange={setNewName}
                label={"Your name"}
                maxWidth={"100%"}
                placeholder={"Quentin Tarantino"}
                color={"accent"}
            />
            <p className={"small"}>You can always change your name in the Account settings.</p>

            <button
                disabled={wuConstants.Regex.empty.test(newName)}
                onClick={handleNewUserNameSubmit}
                className={"main"}
            >
                Done
            </button>
        </div>
    )
}