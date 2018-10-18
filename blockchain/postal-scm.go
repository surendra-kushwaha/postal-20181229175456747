
/*
 * The sample smart contract for documentation topic:
 * Writing Postal SCM Application
 */

package main

/* Imports
 * 4 utility libraries for formatting, handling bytes, reading and writing JSON, and string manipulation
 * 2 specific Hyperledger Fabric specific libraries for Smart Contracts
 */
import (
	"time"
 	"errors"
	"encoding/json"
	"fmt"
	//"strconv"
	//"strconv"

	"github.com/hyperledger/fabric/core/chaincode/shim"
	sc "github.com/hyperledger/fabric/protos/peer"
)

// Define the Smart Contract structure
type PostalScmChainCode struct {
}


type Postal struct{
	PostalID string `json:"PostalID"`
	Name string `json:"Name"`
	Country string `json:"Country"`
	TransactionName string `json:"TransactionName"`
	TimeStamp  time.Time `json:"TimeStamp"`
}

// Define the package structure, with 10 properties.  Structure tags are used by encoding/json library
type PostalPackage struct {
	PackageID   string `json:"PackageID"`
	Weight  string `json:"Weight"`
	OriginCountry string `json:"OriginCountry"`
	DestinationCountry string `json:"DestinationCountry"`
	SettlementStatus   string `json:"SettlementStatus"`
	ShipmentStatus   string `json:"ShipmentStatus"`
	PackageType   string `json:"PackageType"`
	OriginReceptacleID  string `json:"OriginReceptacleID"`
	DispatchID   string `json:"DispatchID"`
	LastUpdated string `json:"LastUpdated"`
	TransactionName string `json:"TransactionName"`
	TimeStamp  time.Time `json:"TimeStamp"`
}

/*
 * The Init method is called when the Smart Contract "postalscm" is instantiated by the blockchain network
 * Best practice is to have any Ledger initialization in separate function -- see initLedger()
 */
func (self *PostalScmChainCode) Init(APIstub shim.ChaincodeStubInterface) sc.Response {
	return shim.Success(nil)
}

/*
 * The Invoke method is called as a result of an application request to run the Smart Contract "postalscm"
 * The calling application program has also specified the particular smart contract function to be called, with arguments
 */
func (self *PostalScmChainCode) Invoke(APIstub shim.ChaincodeStubInterface) sc.Response {

	// Retrieve the requested Smart Contract function and arguments
	function, args := APIstub.GetFunctionAndParameters()
	// Route to the appropriate handler function to interact with the ledger appropriately

	if function == "addPostal" {
			fmt.Println("invoking addPostal " + function)
			testBytes,err := addPostal(args[0],APIstub)
			if err != nil {
				fmt.Println("Error performing addPostal ")
				return shim.Error(err.Error())
			}
			fmt.Println("Processed addPostal successfully. ")
			return shim.Success(testBytes)
	}

	if function == "createPostalPackage" {
			fmt.Println("invoking CreatePostalPackage " + function)
			testBytes,err := createPostalPackage(args[0],APIstub)
			if err != nil {
				fmt.Println("Error performing createPostalPackage ")
				return shim.Error(err.Error())
			}
			fmt.Println("Processed PostalPackage created successfully. ")
			return shim.Success(testBytes)
	}

	if function == "updateSettlementStatus" {
			fmt.Println("invoking updateSettlementStatus " + function)
			return updateSettlementStatus(APIstub,args)
	}

	if function == "updateShipmentStatus" {
			fmt.Println("invoking updateShipmentStatus " + function)
			return updateShipmentStatus(APIstub,args);
	}

	if function == "getPackageHistory"{        //read history of a package (audit)
		return getPackageHistory(APIstub, args)
	}


	bytes, err:= QueryDetails(APIstub, function,args)
		if err != nil {
			fmt.Println("Error retrieving query details  ")
			return shim.Error(err.Error())
	}
	return shim.Success(bytes)

	return shim.Error("Invalid Smart Contract function name.")
}

	
	func QueryDetails(APIstub shim.ChaincodeStubInterface, function string, args []string) ([]byte, error){

		if function == "queryPostal" {
			fmt.Println("Invoking queryPostal " + function)
			var postalData Postal
			postalData,err := queryPostal(args[0], APIstub)
			if err != nil {
				fmt.Println("Error receiving  the Postal")
				return nil, errors.New("Error receiving  the Postal")
			}
			fmt.Println("All success, returning Postal")
			return json.Marshal(postalData)
	   }

		if function == "queryPackage" {
			fmt.Println("Invoking queryPackage " + function)
			var postalPackageData PostalPackage
			postalPackageData,err := queryPackage(args[0], APIstub)
			if err != nil {
				fmt.Println("Error receiving  the Package")
				return nil, errors.New("Error receiving  the Packages")
			}
			fmt.Println("All success, returning Package")
			return json.Marshal(postalPackageData)
		}

	return nil, errors.New("Received unknown query function name")

	}

	 func addPostal(userJSON string, stub shim.ChaincodeStubInterface) ([]byte, error) {
		fmt.Println("In services.AddUser start ")
		res := &Postal{}
		//user := &User{}
		err := json.Unmarshal([]byte(userJSON), res)
		res.TransactionName = "addPostal"
		res.TimeStamp=time.Now()
		if err != nil {
			fmt.Println("Failed to unmarshal user ")
			return nil, err
			//return shim.Error(err.Error())
		}
		fmt.Println("User ID : ",res.PostalID)

		body, err := json.Marshal(res)
		if err != nil {
			return nil, err
		}
		fmt.Println(string(body))
		err = stub.PutState(res.PostalID, []byte(string(body)))
		if err != nil {
			fmt.Println("Failed to create User ")
			return nil, err
			//return shim.Error(err.Error())
		}

		//stub.SetEvent("AddPostalEvent", []byte(string(body)))
		err = stub.SetEvent("PostalEvent", []byte(string(body)))
		
		fmt.Println("Created User  with Key : "+ res.PostalID)
		fmt.Println("In initialize.AddUser end ")
		return nil,nil

	}

func queryPostal(postalId string, APIstub shim.ChaincodeStubInterface)(Postal, error) {
		fmt.Println("In query.GetPackage start ")

		key := postalId
		var postalData Postal
		postalBytes, err := APIstub.GetState(key)
		if err != nil {
			fmt.Println("Error retrieving postal" , postalId)
			return postalData, errors.New("Error receiving the postal")
			//return shim.Error(err.Error())
		}
		err = json.Unmarshal(postalBytes, &postalData)
		fmt.Println("Postal   : " , postalData);
		fmt.Println("In query.GetPackage end ")
		return postalData, err
	}

/*
func addPostal12(APIstub shim.ChaincodeStubInterface, args []string) sc.Response {
	var err error

	if len(args) != 3 {
		return shim.Error("Incorrect number of arguments. Expecting 3")
	}

	// ==== Input sanitation ====
	fmt.Println("- start creating  postal")
	if len(args[0]) <= 0 {
		return shim.Error("1st argument must be a non-empty string")
	}
	if len(args[1]) <= 0 {
		return shim.Error("2nd argument must be a non-empty string")
	}
	if len(args[2]) <= 0 {
		return shim.Error("3rd argument must be a non-empty string")
	}
	postalId := args[0]
	name := args[1]
	country := args[2]
	
	// ==== Check if marble already exists ====
	postalAsBytes, err := APIstub.GetState(postalId)
	if err != nil {
		return shim.Error("Failed to get postal: " + err.Error())
	} else if postalAsBytes != nil {
		fmt.Println("This postalId already exists: " + postalId)
		return shim.Error("This postalId already exists: " + postalId)
	}

	// ==== Create marble object and marshal to JSON ====
	//objectType := "marble"
	postal := &Postal{postalId, name, country}
	postalJSONasBytes, err := json.Marshal(postal)
	if err != nil {
		return shim.Error(err.Error())
	}

	// === Save postal to state ===
	err = APIstub.PutState(postalId, postalJSONasBytes)
	if err != nil {
		return shim.Error(err.Error())
	}
	fmt.Println("- end creating postal")
	return shim.Success(nil)
}*/


func queryPackage(packageId string, stub shim.ChaincodeStubInterface)(PostalPackage, error) {
		fmt.Println("In query.GetPackage start ")
		key := packageId
		var postalPackageData PostalPackage
		postalBytes, err := stub.GetState(key)
		if err != nil {
			fmt.Println("Error retrieving package" , packageId)
			return postalPackageData, errors.New("Error receiving the package")
			//return shim.Error(err.Error())
		}
		err = json.Unmarshal(postalBytes, &postalPackageData)
		fmt.Println("Postal   : " , postalPackageData);
		fmt.Println("In query.GetPackage end ")
		return postalPackageData, err
	}

// ============================================================================================================================
// Get history of asset
//
// Shows Off GetHistoryForKey() - reading complete history of a key/value
// ============================================================================================================================
func getPackageHistory(stub shim.ChaincodeStubInterface, args []string) sc.Response {
	type AuditHistory struct {
		TxId    string   `json:"txId"`
		Value   PostalPackage  `json:"value"`
	}
	var history []AuditHistory;
	var packageData PostalPackage

	if len(args) != 1 {
		return shim.Error("Incorrect number of arguments. Expecting 1")
	}

	packageId := args[0]
	fmt.Printf("- start getHistoryForPackage: %s\n", packageId)

	// Get History
	resultsIterator, err := stub.GetHistoryForKey(packageId)
	if err != nil {
		return shim.Error(err.Error())
	}
	defer resultsIterator.Close()

	for resultsIterator.HasNext() {
		historyData, err := resultsIterator.Next()
		if err != nil {
			return shim.Error(err.Error())
		}

		var tx AuditHistory
		tx.TxId = historyData.TxId                     //copy transaction id over
		json.Unmarshal(historyData.Value, &packageData)     //un stringify it aka JSON.parse()
		if historyData.Value == nil {                  //package has been deleted
			var emptypackage PostalPackage
			tx.Value = emptypackage                 //copy nil package
		} else {
			json.Unmarshal(historyData.Value, &packageData) //un stringify it aka JSON.parse()
			tx.Value = packageData                      //copy package over
		}
		history = append(history, tx)              //add this tx to the list
	}
	fmt.Printf("- getHistoryForPackage returning:\n%s", history)

	//change to array of bytes
	historyAsBytes, _ := json.Marshal(history)     //convert to array of bytes
	return shim.Success(historyAsBytes)
}

func createPostalPackage(packageJSON string, stub shim.ChaincodeStubInterface) ([]byte, error) {
		fmt.Println("In services.AddUser start ")
		res := &PostalPackage{}
		//user := &User{}
		err := json.Unmarshal([]byte(packageJSON), res)
		res.TransactionName = "createPostalPackage"
		res.TimeStamp=time.Now()
		if err != nil {
			fmt.Println("Failed to unmarshal package ")
			return nil, err
			//return shim.Error(err.Error())
		}
		fmt.Println("Package ID : ",res.PackageID)
		body, err := json.Marshal(res)
		if err != nil {
			return nil, err
		}
		fmt.Println(string(body))
		//err = stub.PutState(res.packageId + "_" + res.UserType, []byte(string(body)))
		err = stub.PutState(res.PackageID, []byte(string(body)))
		if err != nil {
			fmt.Println("Failed to create package ")
			return nil, err
			//return shim.Error(err.Error())
		}

		err = stub.SetEvent("PostalEvent", []byte(string(body)))

		fmt.Println("Created User  with Key : "+ res.PackageID)
		fmt.Println("In initialize.PACKAGE end ")
		return nil,nil
	}

//Update settlement status for package.
func updateSettlementStatus(APIstub shim.ChaincodeStubInterface, args []string) sc.Response {

	if len(args) !=3 {
		return shim.Error("Incorrect number of arguments. Expecting 3")
	}

	packageAsBytes, _ := APIstub.GetState(args[0])
	packageData := PostalPackage{}

	json.Unmarshal(packageAsBytes, &packageData)
	packageData.SettlementStatus = args[1]
	packageData.LastUpdated = args[2]
	packageData.TransactionName = "updateSettlementStatus"
	packageData.TimeStamp=time.Now()

	packageAsBytes, _ = json.Marshal(packageData)
	APIstub.PutState(args[0], packageAsBytes)

	//APIstub.SetEvent("SettlementPackageEvent", packageAsBytes)
	/*err = APIstub.SetEvent("SettlementPackageEvent", packageAsBytes)
	if err != nil {
		return shim.Error(err.Error())
	}*/

	APIstub.SetEvent("PostalEvent", packageAsBytes)

	return shim.Success(nil)
}

//Update shipment status for package.
func updateShipmentStatus(APIstub shim.ChaincodeStubInterface, args []string) sc.Response {

	if len(args) !=5 {
		return shim.Error("Incorrect number of arguments. Expecting 5")
	}

	packageAsBytes, _ := APIstub.GetState(args[0])
	packageData := PostalPackage{}

	json.Unmarshal(packageAsBytes, &packageData)
	packageData.ShipmentStatus = args[1]
	packageData.OriginReceptacleID = args[2]
	packageData.DispatchID = args[3]
	packageData.LastUpdated = args[4]
	packageData.TransactionName = "updateShipmentStatus"
	packageData.TimeStamp=time.Now()

	packageAsBytes, _ = json.Marshal(packageData)
	APIstub.PutState(args[0], packageAsBytes)

	//APIstub.SetEvent("ShipmentPackageEvent", packageAsBytes)
	/*err = APIstub.SetEvent("ShipmentPackageEvent", packageAsBytes)
	if err != nil {
		return shim.Error(err.Error())
	}*/
	APIstub.SetEvent("PostalEvent", packageAsBytes)

	return shim.Success(nil)
}

// The main function is only relevant in unit test mode. Only included here for completeness.
func main() {

	// Create a new Smart Contract
	err := shim.Start(new(PostalScmChainCode))
	if err != nil {
		fmt.Printf("Error creating new Smart Contract: %s", err)
	}
}
